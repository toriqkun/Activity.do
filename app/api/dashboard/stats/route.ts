import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    // Find todos where user is owner or accepted collaborator
    const todos = await prisma.todo.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId: userId,
                status: "ACCEPTED",
              },
            },
          },
        ],
      },
      select: {
          completed: true,
          favorites: true,
      }
    });

    const stats = {
      all: todos.length,
      progress: todos.filter((t: any) => !t.completed).length,
      done: todos.filter((t: any) => t.completed).length,
      favorites: todos.filter((t: any) => t.favorites).length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
