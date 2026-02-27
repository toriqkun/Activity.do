import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

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
      include: {
        category: true,
        collaborators: {
          include: {
            user: {
              select: { username: true, fullName: true, photoProfile: true },
            },
          },
        },
      },
      orderBy: [
        { position: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error("Fetch Todos Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data todo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { task, description, priority, categoryId, ownerId } = await req.json();

    if (!task || !ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const maxPositionTodo = await prisma.todo.findFirst({
      where: { ownerId },
      orderBy: { position: "desc" },
    });
    const position = maxPositionTodo ? maxPositionTodo.position + 1 : 0;

    const todo = await prisma.todo.create({
      data: {
        task,
        description,
        priority: priority.toUpperCase(),
        categoryId,
        ownerId,
        position,
      },
    });

    return NextResponse.json({ todo });
  } catch (error) {
    console.error("Create Todo Error:", error);
    return NextResponse.json({ error: "Gagal membuat todo" }, { status: 500 });
  }
}
