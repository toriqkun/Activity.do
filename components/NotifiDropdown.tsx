// // src/components/NotifDropdown.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { Bell } from "lucide-react";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { respondToInvite, findCollabRecord } from "@/lib/collabActions";

// export default function NotifDropdown({ userId, username }: { userId: string; username?: string }) {
//   const [open, setOpen] = useState(false);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     if (!userId) return;

//     async function fetchNotif() {
//       const { data, error } = await supabase
//         .from("notifications")
//         .select(
//           `
//           id,
//           message,
//           read,
//           created_at,
//           todo_id,
//           type,
//           sender_id
//         `
//         )
//         .eq("user_id", userId)
//         .order("created_at", { ascending: false });

//       if (!error && data) setNotifications(data);
//       if (error) console.error("fetch notifications error", error);
//     }

//     fetchNotif();

//     const channel = supabase
//       .channel(`notifications-${userId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${userId}`,
//         },
//         () => fetchNotif()
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [userId]);

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   async function markRead(id: string) {
//     await supabase.from("notifications").update({ read: true }).eq("id", id);
//     setNotifications((prev) => prev.map((p) => (p.id === id ? { ...p, read: true } : p)));
//   }

//   async function handleAccept(notif: any) {
//     try {
//       // find collaborator record based on todo_id + current user (notif may not include collab id)
//       const collab = await findCollabRecord(notif.todo_id, userId);
//       if (!collab) return toast.error("Collaboration record not found");

//       await respondToInvite({
//         collabId: collab.id,
//         action: "accepted",
//         currentUserId: userId,
//         currentUsername: username,
//       });

//       await markRead(notif.id);
//       toast.success("Collaboration accepted");
//       setOpen(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to accept invite");
//     }
//   }

//   async function handleDecline(notif: any) {
//     try {
//       const collab = await findCollabRecord(notif.todo_id, userId);
//       if (!collab) return toast.error("Collaboration record not found");

//       await respondToInvite({
//         collabId: collab.id,
//         action: "rejected",
//         currentUserId: userId,
//         currentUsername: username,
//       });

//       await markRead(notif.id);
//       toast.success("Collaboration declined");
//       setOpen(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to decline invite");
//     }
//   }

//   return (
//     <div className="relative">
//       <button onClick={() => setOpen((p) => !p)} className="relative p-2 hover:bg-gray-100 rounded-full">
//         <Bell size={22} className="text-gray-700" />
//         {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50">
//           <div className="p-2 border-b font-semibold text-gray-700">Notifications</div>
//           {notifications.length === 0 ? (
//             <div className="p-3 text-center text-gray-500 text-sm">No notifications</div>
//           ) : (
//             notifications.map((n) => (
//               <div key={n.id} className={`p-3 border-b text-sm ${!n.read ? "bg-blue-50" : ""}`}>
//                 <p className="text-gray-800">{n.message}</p>
//                 <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>

//                 {n.type === "collab_invite" ? (
//                   <div className="flex gap-2 mt-2">
//                     <button onClick={() => handleAccept(n)} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
//                       Accept
//                     </button>
//                     <button onClick={() => handleDecline(n)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
//                       Decline
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="mt-2">
//                     <button
//                       onClick={async () => {
//                         await markRead(n.id);
//                         setOpen(false);
//                         if (n.todo_id) router.push(`/activitydo/todo-app?todo=${n.todo_id}`);
//                       }}
//                       className="text-blue-600 text-xs underline"
//                     >
//                       View Todo
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);

      if (error) console.error("Error fetching notifications:", error);
      else setNotifications(data || []);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-2 w-64">
      <h3 className="font-semibold border-b pb-1 mb-2">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-400 text-sm text-center">No notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="text-sm">
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
