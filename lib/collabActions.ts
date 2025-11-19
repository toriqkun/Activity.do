// // src/lib/collabActions.ts
// import { supabase } from "./supabaseClient";

import { div } from "framer-motion/client";

// /**
//  * inviteCollaborator
//  * - buat record todo_collaborators (status pending)
//  * - buat notifikasi ke invitedUserId (simpan invited_by & sender_id)
//  */
// export async function inviteCollaborator({
//   todoId,
//   invitedUserId,
//   inviterId,
//   inviterName,
//   todoTitle,
// }: {
//   todoId: string;
//   invitedUserId: string;
//   inviterId: string;
//   inviterName?: string;
//   todoTitle?: string;
// }) {
//   try {
//     // insert collaborator pending
//     const { data: collabData, error: collabError } = await supabase
//       .from("todo_collaborators")
//       .insert([
//         {
//           todo_id: todoId,
//           user_id: invitedUserId,
//           status: "pending",
//           invited_by: inviterId,
//         },
//       ])
//       .select()
//       .single();

//     if (collabError) throw collabError;

//     // insert notification to invited user
//     const message = inviterName ? `${inviterName} invited you to collaborate on "${todoTitle ?? ""}".` : `You were invited to collaborate on "${todoTitle ?? ""}".`;

//     const { error: notifError } = await supabase.from("notifications").insert([
//       {
//         user_id: invitedUserId,
//         sender_id: inviterId,
//         todo_id: todoId,
//         type: "collab_invite",
//         message,
//         read: false,
//       },
//     ]);

//     if (notifError) throw notifError;

//     return collabData;
//   } catch (err) {
//     console.error("inviteCollaborator error:", err);
//     throw err;
//   }
// }

// /**
//  * respondToInvite
//  * - collabId: id record dari todo_collaborators
//  * - action: "accepted" | "rejected"
//  * - will insert notification back to invited_by (pengundang)
//  */
// export async function respondToInvite({ collabId, action, currentUserId, currentUsername }: { collabId: string; action: "accepted" | "rejected"; currentUserId: string; currentUsername?: string }) {
//   try {
//     // Ambil record collab untuk tahu todo_id dan invited_by
//     const { data: collab, error: getErr } = await supabase.from("todo_collaborators").select("id, todo_id, user_id, invited_by").eq("id", collabId).single();

//     if (getErr) throw getErr;

//     // update status
//     const { error: updErr } = await supabase.from("todo_collaborators").update({ status: action }).eq("id", collabId);

//     if (updErr) throw updErr;

//     // fetch todo title for nicer message (optional)
//     const { data: todo } = await supabase.from("todos").select("task").eq("id", collab.todo_id).single();

//     const message =
//       action === "accepted"
//         ? `${currentUsername ?? "A user"} accepted your collaboration invite on "${todo?.task ?? ""}".`
//         : `${currentUsername ?? "A user"} declined your collaboration invite on "${todo?.task ?? ""}".`;

//     // send notification back to inviter (invited_by)
//     const { error: notifErr } = await supabase.from("notifications").insert([
//       {
//         user_id: collab.invited_by, // pengundang akan menerima notif
//         sender_id: currentUserId,
//         todo_id: collab.todo_id,
//         type: "collab_response",
//         message,
//         read: false,
//       },
//     ]);

//     if (notifErr) throw notifErr;

//     return { success: true };
//   } catch (err) {
//     console.error("respondToInvite error:", err);
//     throw err;
//   }
// }

// /**
//  * Helper: find collaborator record id given todoId & userId (useful if you don't have collabId)
//  */
// export async function findCollabRecord(todoId: string, userId: string) {
//   const { data, error } = await supabase.from("todo_collaborators").select("id, todo_id, user_id, status, invited_by").eq("todo_id", todoId).eq("user_id", userId).single();

//   if (error) {
//     // not found returns error, return null
//     return null;
//   }
//   return data;
// }

div