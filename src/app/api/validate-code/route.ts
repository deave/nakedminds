import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Invitation code is required" },
        { status: 400 }
      );
    }

    const invitationCode = await prisma.invitationCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!invitationCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid invitation code" },
        { status: 400 }
      );
    }

    if (!invitationCode.active) {
      return NextResponse.json(
        { valid: false, error: "This invitation code is no longer active" },
        { status: 400 }
      );
    }

    if (invitationCode.expiresAt && invitationCode.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This invitation code has expired" },
        { status: 400 }
      );
    }

    if (invitationCode.uses >= invitationCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: "This invitation code has reached its usage limit" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Validate code error:", error);
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
