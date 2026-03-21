import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required").max(50),
  invitationCode: z.string().min(1, "Invitation code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, displayName, invitationCode } = parsed.data;

    // Validate invitation code
    const codeRecord = await prisma.invitationCode.findUnique({
      where: { code: invitationCode.trim().toUpperCase() },
    });

    if (!codeRecord || !codeRecord.active) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 400 }
      );
    }

    if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation code has expired" },
        { status: 400 }
      );
    }

    if (codeRecord.uses >= codeRecord.maxUses) {
      return NextResponse.json(
        { error: "This invitation code has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    // Create user and increment code usage in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          invitationCodeId: codeRecord.id,
        },
      });

      await tx.invitationCode.update({
        where: { id: codeRecord.id },
        data: { uses: { increment: 1 } },
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
