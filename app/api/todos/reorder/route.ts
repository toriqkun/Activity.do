import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { todos } = await req.json(); // Array of { id: string, position: number }

    if (!Array.isArray(todos)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Update positions in a transaction
    await prisma.$transaction(
      todos.map((t: { id: string; position: number }) =>
        prisma.todo.update({
          where: { id: t.id },
          data: { position: t.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui urutan" }, { status: 500 });
  }
}
