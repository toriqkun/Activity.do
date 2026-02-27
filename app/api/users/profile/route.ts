import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        photoProfile: true,
        birthOfDate: true,
        phone: true,
        bio: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ error: "Gagal mengambil profil" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, username, birthOfDate, phone, bio, photoProfile } = body;

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        birthOfDate: birthOfDate ? new Date(birthOfDate) : null,
        phone,
        bio,
        photoProfile,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        photoProfile: updatedUser.photoProfile,
        birthOfDate: updatedUser.birthOfDate,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
      }
    });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
