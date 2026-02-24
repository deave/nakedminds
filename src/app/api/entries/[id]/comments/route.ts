import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(1000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const comments = await prisma.comment.findMany({
    where: { monthlyEntryId: params.id },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify entry exists
  const entry = await prisma.monthlyEntry.findUnique({
    where: { id: params.id },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const comment = await prisma.$transaction(async (tx) => {
    const newComment = await tx.comment.create({
      data: {
        authorId: session!.user.id,
        monthlyEntryId: params.id,
        body: parsed.data.body,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification for the entry owner (unless commenting on own entry)
    if (entry.userId !== session!.user.id) {
      await tx.notification.create({
        data: {
          userId: entry.userId,
          type: "COMMENT",
          referenceId: newComment.id,
        },
      });
    }

    return newComment;
  });

  return NextResponse.json(comment, { status: 201 });
}
