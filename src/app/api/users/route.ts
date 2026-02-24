import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
    orderBy: { displayName: "asc" },
  });

  return NextResponse.json(users);
}
