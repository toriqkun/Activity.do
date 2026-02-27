import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, fullName } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User or Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email,
        username,
        fullName,
        password: hashedPassword,
        verificationToken,
        tokenExpiry,
        isVerified: false,
      },
    });

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${verificationToken}`;

    await sendEmail(
      email,
      "Verifikasi Akun Anda - Activity.do",
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h1 style="color: #2563eb; font-size: 24px;">Selamat Datang di Activity.do!</h1>
        <p>Halo ${fullName},</p>
        <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi akun Anda dan mulai mengelola tugas Anda.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verifikasi Akun</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Tautan ini akan kedaluwarsa dalam 24 jam.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Jika Anda tidak merasa mendaftar di layanan kami, silakan abaikan email ini.</p>
      </div>
      `
    );

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
