import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Store old category ID to check for cleanup later
    const oldTodo = await prisma.todo.findUnique({
      where: { id },
      select: { categoryId: true, ownerId: true }
    });

    // Map priority if it exists
    if (body.priority) {
      body.priority = body.priority.toUpperCase();
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: body,
    });

    // If category changed, check if old category is now empty
    if (oldTodo?.categoryId && body.categoryId && oldTodo.categoryId !== body.categoryId) {
      const count = await prisma.todo.count({
        where: { categoryId: oldTodo.categoryId }
      });
      if (count === 0) {
        await prisma.category.delete({
          where: { id: oldTodo.categoryId, userId: oldTodo.ownerId }
        }).catch(() => {}); // Ignore if already deleted
      }
    }

    return NextResponse.json({ todo });
  } catch (error: any) {
    console.error("Update Todo Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui todo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get category ID before deleting
    const todo = await prisma.todo.findUnique({
      where: { id },
      select: { categoryId: true, ownerId: true }
    });

    await prisma.todo.delete({
      where: { id },
    });

    // Cleanup empty category
    if (todo?.categoryId) {
      const count = await prisma.todo.count({
        where: { categoryId: todo.categoryId }
      });
      if (count === 0) {
        await prisma.category.delete({
          where: { id: todo.categoryId, userId: todo.ownerId }
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Todo Error:", error);
    return NextResponse.json({ error: "Gagal menghapus todo" }, { status: 500 });
  }
}
