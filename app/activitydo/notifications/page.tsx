"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  async function fetchNotifications() {
    const { data, error } = await supabase.from("notifications").select("*, todos(task)").eq("user_id", userId).order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotifications(data);
  }

  async function handleAction(notification: any, action: "accept" | "reject") {
    try {
      if (action === "accept") {
        await supabase.from("todo_collaborators").update({ status: "accepted" }).eq("todo_id", notification.todo_id).eq("user_id", userId);

        await supabase.from("notifications").update({ read: true }).eq("id", notification.id);

        toast.success("You accepted the collaboration!");
      } else {
        await supabase.from("todo_collaborators").update({ status: "rejected" }).eq("todo_id", notification.todo_id).eq("user_id", userId);

        await supabase.from("notifications").update({ read: true }).eq("id", notification.id);

        toast("You rejected the invitation.");
      }

      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process action");
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications yet.</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="border rounded-lg p-3 mb-3 bg-white flex justify-between items-center">
            <div>
              <p className="font-medium">{n.message}</p>
              {n.todos && <p className="text-sm text-gray-500">Todo: {n.todos.task}</p>}
            </div>
            {n.type === "collab_invite" && !n.read && (
              <div className="flex gap-2">
                <button onClick={() => handleAction(n, "accept")} className="px-3 py-1 bg-green-500 text-white rounded">
                  Accept
                </button>
                <button onClick={() => handleAction(n, "reject")} className="px-3 py-1 bg-red-500 text-white rounded">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
