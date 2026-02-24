import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.authorId !== session!.user.id) {
    return NextResponse.json(
      { error: "You can only delete your own comments" },
      { status: 403 }
    );
  }

  await prisma.comment.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Comment deleted" });
}
