import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const createConversationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// List my conversations
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: session!.user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Add unread count and format
  const formatted = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: session!.user.id },
          readAt: null,
        },
      });

      const otherParticipant = conv.participants.find(
        (p) => p.userId !== session!.user.id
      );

      return {
        id: conv.id,
        otherUser: otherParticipant?.user,
        lastMessage: conv.messages[0] || null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    })
  );

  return NextResponse.json(formatted);
}

// Start or get existing conversation with a user
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createConversationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { userId } = parsed.data;

  // Can't DM yourself
  if (userId === session!.user.id) {
    return NextResponse.json(
      { error: "You cannot message yourself" },
      { status: 400 }
    );
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session!.user.id } } },
        { participants: { some: { userId } } },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session!.user.id }, { userId }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id }, { status: 201 });
}
