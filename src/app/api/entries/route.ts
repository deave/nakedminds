import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { getCurrentMonth } from "@/lib/month";

const createEntrySchema = z.object({
  habitAdopt: z.string().min(1, "Please describe the habit you want to adopt").max(200),
  habitRemove: z.string().min(1, "Please describe the habit you want to remove").max(200),
  focusChallenge: z.string().min(1, "Please describe your focus challenge").max(1000),
});

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { year, month } = getCurrentMonth();

  // Check if entry already exists for this month
  const existing = await prisma.monthlyEntry.findUnique({
    where: {
      userId_year_month: {
        userId: session!.user.id,
        year,
        month,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already have an entry for this month. Use PATCH to update it." },
      { status: 409 }
    );
  }

  const entry = await prisma.monthlyEntry.create({
    data: {
      userId: session!.user.id,
      year,
      month,
      ...parsed.data,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
