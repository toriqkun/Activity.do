import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { userId },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, userId } = await req.json();

    if (!name || !userId) {
      return NextResponse.json({ error: "Name and UserId are required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, userId },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}
