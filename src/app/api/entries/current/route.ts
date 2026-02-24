import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { getCurrentMonth } from "@/lib/month";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const { year, month } = getCurrentMonth();

  const entries = await prisma.monthlyEntry.findMany({
    where: { year, month },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
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
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}
