import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { fullName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        photoProfile: true,
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("User Search Error:", error);
    return NextResponse.json({ error: "Gagal mencari user" }, { status: 500 });
  }
}
