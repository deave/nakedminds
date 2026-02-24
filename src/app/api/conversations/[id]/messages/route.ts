import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const sendMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export async function GET(
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

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
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

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Get other participant for notification
  const otherParticipant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: params.id,
      userId: { not: session!.user.id },
    },
  });

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: params.id,
        senderId: session!.user.id,
        body: parsed.data.body,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await tx.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    // Notify other participant
    if (otherParticipant) {
      await tx.notification.create({
        data: {
          userId: otherParticipant.userId,
          type: "MESSAGE",
          referenceId: msg.id,
        },
      });
    }

    return msg;
  });

  return NextResponse.json(message, { status: 201 });
}
