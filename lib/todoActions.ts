// import { supabase } from "./supabaseClient";

// export async function fetchTodos(userId: string) {
//   try {

//     const { data, error } = await supabase
//       .from("todos")
//       .select(
//         `
//         *,
//         category:categories(id, name),
//         todo_collaborators ( id, user_id, status )
//       `
//       )
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     // filter client-side: milik sendiri OR collab accepted
//     const todos = (data || []).filter((t: any) => {
//       if (t.user_id === userId) return true;
//       if (Array.isArray(t.todo_collaborators)) {
//         return t.todo_collaborators.some((c: any) => c.user_id === userId && c.status === "accepted");
//       }
//       return false;
//     });

//     return todos;
//   } catch (err) {
//     console.error("fetchTodos error:", err);
//     return [];
//   }
// }

// export async function createTodo(payload: { task: string; user_id: string; category_id?: string | null; priority?: "low" | "medium" | "high"; completed?: boolean }) {
//   try {
//     const { data, error } = await supabase
//       .from("todos")
//       .insert([
//         {
//           task: payload.task,
//           user_id: payload.user_id,
//           category_id: payload.category_id ?? null,
//           priority: payload.priority ?? "low",
//           completed: payload.completed ?? false,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   } catch (err) {
//     console.error("createTodo error:", err);
//     throw err;
//   }
// }

// /**
//  * Utility: refresh single todo (with collaborators)
//  */
// export async function getTodoById(todoId: string) {
//   const { data, error } = await supabase
//     .from("todos")
//     .select(
//       `
//       *,
//       category:categories(id, name),
//       todo_collaborators ( id, user_id, status, invited_by )
//     `
//     )
//     .eq("id", todoId)
//     .single();

//   if (error) {
//     console.error("getTodoById error:", error);
//     return null;
//   }
//   return data;
// }
