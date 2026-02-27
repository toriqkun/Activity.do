import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is missing" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: {
          gt: new Date(), // Check if token is still valid
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiry: null,
      },
    });

    // Provide a nice redirect or success message
    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
