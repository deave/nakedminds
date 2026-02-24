import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { isCurrentMonth } from "@/lib/month";

const updateEntrySchema = z.object({
  habitAdopt: z.string().min(1).max(200).optional(),
  habitRemove: z.string().min(1).max(200).optional(),
  focusChallenge: z.string().min(1).max(1000).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const entry = await prisma.monthlyEntry.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
      comments: {
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
      },
    },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const entry = await prisma.monthlyEntry.findUnique({
    where: { id: params.id },
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (entry.userId !== session!.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isCurrentMonth(entry.year, entry.month)) {
    return NextResponse.json(
      { error: "You can only edit the current month's entry" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = updateEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updated = await prisma.monthlyEntry.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
