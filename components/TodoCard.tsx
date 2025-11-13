import { MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TodoCard({
  todo,
  toggleCompleted,
  toggleFavorite,
  deleteTodo,
  onEdit,
}: {
  todo: any;
  toggleCompleted: (todo: any) => void;
  toggleFavorite: (todo: any) => void;
  deleteTodo: (id: string) => void;
  onEdit: (todo: any) => void;
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showAllCollabs, setShowAllCollabs] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const isOwner = todo.user_id === userId;

  // useEffect(() => {
  //   async function fetchCollaborators() {
  //     const { data, error } = await supabase
  //       .from("todo_collaborators")
  //       .select(
  //         `
  //   user_id,
  //   profiles ( username, photo_profile )
  // `
  //       )
  //       .eq("todo_id", todo.id)
  //       .eq("status", "accepted");

  //     if (!error && data) setCollaborators(data);
  //   }
  //   fetchCollaborators();
  // }, [todo.id]);

  useEffect(() => {
    async function fetchCollaborators() {
      const { data, error } = await supabase
        .from("todo_collaborators")
        .select(
          `
        user_id,
        status,
        profiles ( username, photo_profile )
      `
        )
        .eq("todo_id", todo.id);

      if (!error && data) setCollaborators(data);
    }

    fetchCollaborators();

    const channel = supabase
      .channel(`todo-collab-${todo.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todo_collaborators",
          filter: `todo_id=eq.${todo.id}`,
        },
        () => fetchCollaborators()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [todo.id]);

  const accepted = collaborators.filter((c) => c.status === "accepted");
  const acceptedToShow = accepted.slice(0, 5);

  return (
    <div className="flex items-center justify-between bg-white border border-gray-600 rounded-xl p-4 shadow-sm mb-3 relative">
      <div className="flex items-center gap-4">
        <p className="text-lg px-2">☰</p>

        {/* Checkbox Done */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => isOwner && toggleCompleted(todo)}
          className={`h-5 w-5 cursor-pointer accent-blue-600 ${!isOwner ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isOwner}
        />

        {/* Favorite Button */}
        <button onClick={() => toggleFavorite(todo)} className="ml-2">
          {todo.favorites ? <Star className="text-yellow-400 fill-yellow-400 cursor-pointer" size={22} /> : <Star className="text-gray-400" size={22} />}
        </button>

        {/* Task Info */}
        <div className="flex">
          <p className={`w-145 px-3 flex-1 text-lg font-medium ${todo.completed ? "" : "text-gray-900"}`}>{todo.task}</p>

          <div className="w-50 flex-none mt-1 text-center">{todo.category && <span className="px-2 py-1 rounded-full bg-gray-300 text-gray-800 text-sm font-medium">{todo.category.name}</span>}</div>

          <div className="w-50 flex-none mt-1 text-center">
            <span className="px-2 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: priorityColor(todo.priority) }}>
              {formatPriority(todo.priority)}
            </span>
          </div>
        </div>
      </div>

      {accepted.length > 0 && (
        <div className="flex items-center gap-2 mr-3">
          <div className="flex -space-x-2">
            {acceptedToShow.map((c, i) => (
              <img
                key={i}
                src={c.profiles?.photo_profile || "/default-avatar.png"}
                alt={c.profiles?.username || "User"}
                className="w-7 h-7 rounded-full border border-white object-cover"
                title={c.profiles?.username}
              />
            ))}
            {accepted.length > 5 && (
              <button
                onClick={() => setShowAllCollabs(true)}
                className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border border-white"
                title={`${accepted.length} collaborators`}
              >
                +{accepted.length - 5}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right: Action menu */}
      <div className="relative">
        <button onClick={() => setOpenMenu(!openMenu)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
          <MoreVertical size={20} />
        </button>

        {openMenu && (
          <div className="absolute right-1 w-28 bg-white border rounded-md overflow-hidden shadow-lg z-10">
            {isOwner ? (
              <>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onEdit(todo);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    deleteTodo(todo.id);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-gray-200 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            ) : (
              <div className="p-2 text-xs text-gray-500">Only owner can edit/delete/complete</div>
            )}
          </div>
        )}
      </div>

      {/* Modal/simple panel: show all collaborators */}
      {showAllCollabs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-4 w-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Collaborators</h3>
              <button onClick={() => setShowAllCollabs(false)} className="text-lg">
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border-b">
                  <img src={c.profiles?.photo_profile || "/default-avatar.png"} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="font-medium">{c.profiles?.username}</div>
                    <div className="text-xs text-gray-500">{c.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function priorityColor(priority: "low" | "medium" | "high") {
  switch (priority) {
    case "low":
      return "#16A34A";
    case "medium":
      return "#FACC15";
    case "high":
      return "#DC2626";
    default:
      return "#6B7280";
  }
}
