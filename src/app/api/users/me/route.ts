import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const updateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  onboarded: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session!.user.id },
    data: parsed.data,
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      onboarded: true,
    },
  });

  return NextResponse.json(user);
}
