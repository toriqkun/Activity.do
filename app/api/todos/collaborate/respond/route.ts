import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { notificationId, action } = await req.json(); // action: "ACCEPTED" | "REJECTED"

    if (!notificationId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        sender: { select: { id: true, username: true } },
        user: { select: { id: true, username: true } },
      },
    });

    if (!notification || !notification.todoId) {
      return NextResponse.json({ error: "Notification or Todo not found" }, { status: 404 });
    }

    const userId = notification.userId;
    const todoId = notification.todoId;

    if (action === "ACCEPTED") {
      // Update collaborator status
      await prisma.collaborator.update({
        where: {
          todoId_userId: { todoId, userId },
        },
        data: { status: "ACCEPTED" },
      });

      // Optional: Notify sender that invite was accepted
      const replyNotification = await prisma.notification.create({
        data: {
          userId: notification.senderId!,
          senderId: userId,
          message: `@${notification.user.username} menerima undangan kolaborasi Anda.`,
          type: "UPDATED",
          todoId,
        },
      });

      if (pusherServer) {
        await pusherServer.trigger(`notifications-${notification.senderId}`, "new-notification", replyNotification);
        // Refresh todo lists for both
        await pusherServer.trigger(`todos-${notification.senderId}`, "todo-refresh", {});
        await pusherServer.trigger(`todos-${userId}`, "todo-refresh", {});
      }
    } else if (action === "REJECTED") {
      // Delete or update collaborator record
      await prisma.collaborator.delete({
        where: {
          todoId_userId: { todoId, userId },
        },
      });

      // Notify sender that invite was rejected
      const replyNotification = await prisma.notification.create({
        data: {
          userId: notification.senderId!,
          senderId: userId,
          message: `@${notification.user.username} menolak undangan kolaborasi Anda.`,
          type: "UPDATED",
          todoId,
        },
      });

      if (pusherServer) {
        await pusherServer.trigger(`notifications-${notification.senderId}`, "new-notification", replyNotification);
        await pusherServer.trigger(`todos-${notification.senderId}`, "todo-refresh", {});
      }
    }

    // Mark current notification as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Collab Response Error:", error);
    return NextResponse.json({ error: "Gagal memproses respon" }, { status: 500 });
  }
}
