import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already a member" },
      { status: 400 }
    );
  }

  // Check if invite already exists
  const existingInvite = await prisma.invite.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingInvite && !existingInvite.used) {
    return NextResponse.json(
      { error: "An invite for this email already exists", invite: existingInvite },
      { status: 400 }
    );
  }

  const invite = await prisma.invite.create({
    data: {
      email: parsed.data.email,
      invitedBy: session!.user.id,
    },
  });

  return NextResponse.json(
    {
      message: "Invite created",
      inviteLink: `${process.env.NEXTAUTH_URL}/register?token=${invite.token}&email=${encodeURIComponent(invite.email)}`,
      token: invite.token,
    },
    { status: 201 }
  );
}

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (session!.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}
