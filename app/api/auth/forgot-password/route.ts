import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true, message: "Jika email terdaftar, instruksi reset akan dikirim." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
"Reset Your Password - Activity.do",
`
<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2 style="color: #2563eb;">Password Reset Request</h2>
  <p>We received a request to reset the password for your Activity.do account. If you did not make this request, you can safely ignore this email.</p>
  <div style="margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Reset Password
    </a>
  </div>
  <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
</div>
`
    );

    return NextResponse.json({ success: true, message: "Instruksi reset password telah dikirim ke email Anda." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
