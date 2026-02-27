import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Clear Notifications Error:", error);
    return NextResponse.json({ error: "Gagal menghapus notifikasi" }, { status: 500 });
  }
}
