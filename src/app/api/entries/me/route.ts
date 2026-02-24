import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const entries = await prisma.monthlyEntry.findMany({
    where: { userId: session!.user.id },
    include: {
      _count: {
        select: { comments: true },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(entries);
}
