import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: params.id,
        userId: session!.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark all messages from other users as read
  await prisma.message.updateMany({
    where: {
      conversationId: params.id,
      senderId: { not: session!.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ message: "Marked as read" });
}
