"use client";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { Bell, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRef } from "react";

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial notifications
    async function fetchNotifications() {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
      }
    }

    if (userId) fetchNotifications();

    // 2. Click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // 3. Subscribe to real-time notifications
    if (pusherClient && userId) {
      const channel = pusherClient.subscribe(`notifications-${userId}`);
      
      channel.bind("new-notification", (notification: any) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast(`🔔 Notifikasi Baru: ${notification.message}`, {
          duration: 4000,
          position: "top-right",
        });
      });

      return () => {
        if (pusherClient) pusherClient.unsubscribe(`notifications-${userId}`);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userId]);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    setUnreadCount(0);
    await fetch(`/api/notifications/mark-as-read`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  };

  const clearAllEvents = async () => {
    try {
      const res = await fetch(`/api/notifications/clear-all?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success("All notifications cleared");
      }
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleRespond = async (notificationId: string, action: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch("/api/todos/collaborate/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action }),
      });

      if (res.ok) {
        toast.success(action === "ACCEPTED" ? "Undangan diterima ✅" : "Undangan ditolak ❌");
        // Update local state: remove notification or mark as read
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error("Gagal merespon");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan ❌");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAsRead(); }}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border-t-4 border-t-blue-600">
          <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAllEvents}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-col max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b border-gray-50 transition ${!n.isRead ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                  <div className="flex justify-between items-start">
                    <p className={`text-sm text-gray-800 ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.message}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {n.type === "COLLAB_INVITE" && !n.isRead && (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRespond(n.id, "ACCEPTED"); }}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRespond(n.id, "REJECTED"); }}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-400 text-xs font-semibold rounded-lg hover:bg-gray-200 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
