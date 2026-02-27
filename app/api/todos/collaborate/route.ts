import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { todoId, userId, senderId, taskTitle } = await req.json();

    if (!todoId || !userId || !senderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert collaborator status
    const collaborator = await prisma.collaborator.upsert({
      where: {
        todoId_userId: { todoId, userId },
      },
      update: { status: "PENDING" },
      create: {
        todoId,
        userId,
        status: "PENDING",
      },
    });

    // Create persistent notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        senderId,
        message: `Kamu diundang untuk berkolaborasi pada: ${taskTitle}`,
        type: "COLLAB_INVITE",
        todoId,
      },
      include: {
        sender: {
          select: { username: true, fullName: true, photoProfile: true },
        },
      },
    });

    // Real-time notification via Pusher
    if (pusherServer) {
      await pusherServer.trigger(`notifications-${userId}`, "new-notification", notification);
    }

    return NextResponse.json({ success: true, collaborator });
  } catch (error: any) {
    console.error("Collaboration Invite Error:", error);
    return NextResponse.json({ error: "Gagal mengirim undangan" }, { status: 500 });
  }
}
