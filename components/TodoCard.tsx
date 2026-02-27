"use client";
import { MoreVertical, Pencil, Trash2, Star, ClipboardList } from "lucide-react";
import { useState } from "react";

export default function TodoCard({
  todo,
  toggleCompleted,
  toggleFavorite,
  deleteTodo,
  onEdit,
  onView,
  provided,
}: {
  todo: any;
  toggleCompleted: (todo: any) => void;
  toggleFavorite: (todo: any) => void;
  deleteTodo: (id: string) => void;
  onEdit: (todo: any) => void;
  onView: (todo: any) => void;
  provided?: any;
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showAllCollabs, setShowAllCollabs] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  
  const isOwner = todo.ownerId === userId;
  
  // Use collaborators from the todo object instead of fetching them here
  const collaborators = todo.collaborators || [];
  const accepted = collaborators.filter((c: any) => c.status === "ACCEPTED");
  const acceptedToShow = accepted.slice(0, 5);

  return (
    <div 
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-400 rounded-2xl p-4 shadow-sm mb-4 relative hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          {...provided?.dragHandleProps}
          className="hidden md:block text-gray-300 cursor-grab active:cursor-grabbing px-1 hover:text-blue-500 transition-colors"
        >
          ☰
        </div>

        {/* Checkbox Done */}
        <div className="flex-shrink-0">
            <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => isOwner && toggleCompleted(todo)}
            className={`h-5 w-5 rounded-lg cursor-pointer accent-blue-600 transition-transform active:scale-90 ${!isOwner ? "opacity-30 cursor-not-allowed" : ""}`}
            disabled={!isOwner}
            />
        </div>

        {/* Favorite Button */}
        <button onClick={() => toggleFavorite(todo)} className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
          {todo.favorites ? <Star className="text-yellow-400 fill-yellow-400" size={20} /> : <Star className="text-gray-400 group-hover:text-gray-500" size={20} />}
        </button>

        {/* Task Title & Badges */}
        <div className="flex flex-col md:flex-row md:items-center flex-1 min-w-0 gap-4 md:gap-8 ml-1">
          <p className={`text-base md:text-lg font-bold truncate ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
            {todo.task}
          </p>

          <div className="flex items-center gap-5 flex-wrap">
            {todo.category && (
               <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase tracking-tight">
                 {todo.category.name}
               </span>
            )}
            <span className="px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-tight" style={{ backgroundColor: priorityColor(todo.priority) }}>
              {formatPriority(todo.priority)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
        {accepted.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2.5">
              {acceptedToShow.map((c: any, i: number) => (
                <img
                  key={i}
                  src={c.user?.photoProfile || "/default-avatar.png"}
                  alt={c.user?.username || "Collaborator"}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100"
                  title={c.user?.username}
                />
              ))}
              {accepted.length > 5 && (
                <button
                  onClick={() => setShowAllCollabs(true)}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 border-2 border-white font-bold cursor-pointer hover:bg-gray-100 transition"
                >
                  +{accepted.length - 5}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: Action menu */}
        <div className="relative ml-auto md:ml-0">
          <button onClick={() => setOpenMenu(!openMenu)} className="p-2 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition cursor-pointer text-gray-500 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>

          {openMenu && (
            <div className="absolute right-0 top-12 w-44 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setOpenMenu(false);
                  onView(todo);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 cursor-pointer text-gray-700 transition"
              >
                <ClipboardList size={18} className="text-gray-400" /> Detail Task
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      onEdit(todo);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 cursor-pointer text-gray-700 transition"
                  >
                    <Pencil size={18} className="text-gray-400" /> Edit Task
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      deleteTodo(todo.id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 cursor-pointer transition"
                  >
                    <Trash2 size={18} className="text-red-400" /> Delete Task
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: show all collaborators */}
      {showAllCollabs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-800">Collaborators</h3>
              <button onClick={() => setShowAllCollabs(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {collaborators.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <img src={c.user?.photoProfile || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{c.user?.username || "Anonymous"}</div>
                    <div className={`text-xs font-medium uppercase ${c.status === "ACCEPTED" ? "text-green-600" : "text-amber-500"}`}>{c.status}</div>
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
  if (!priority) return "Medium";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function priorityColor(priority: "low" | "medium" | "high" | string) {
  switch (priority?.toLowerCase()) {
    case "low":
      return "#10B981"; // Emerald 500
    case "medium":
      return "#F59E0B"; // Amber 500
    case "high":
      return "#EF4444"; // Red 500
    default:
      return "#6B7280";
  }
}
