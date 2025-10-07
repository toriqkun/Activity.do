import { MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="flex items-center justify-between bg-white border border-gray-600 rounded-xl p-4 shadow-sm mb-3 relative">
      <div className="flex items-center gap-4">
        <p className="text-lg px-2">☰</p>

        {/* Checkbox Done */}
        <input type="checkbox" checked={todo.completed} onChange={() => toggleCompleted(todo)} className="h-5 w-5 cursor-pointer accent-blue-600" />

        {/* Favorite Button */}
        <button onClick={() => toggleFavorite(todo)} className="ml-2">
          {todo.favorites ? <Star className="text-yellow-400 fill-yellow-400 cursor-pointer" size={22} /> : <Star className="text-gray-400" size={22} />}
        </button>

        {/* Task Info */}
        <div className="flex">
          <p className={`w-145 px-3 flex-1 text-lg font-medium ${todo.completed ? "" : "text-gray-900"}`}>{todo.task}</p>

          {/* Category */}
          <div className="w-50 flex-none mt-1 text-center">{todo.category && <span className="px-2 py-1 rounded-full bg-gray-300 text-gray-800 text-sm font-medium">{todo.category.name}</span>}</div>

          {/* Priority */}
          <div className="w-50 flex-none mt-1 text-center">
            <span className="px-2 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: priorityColor(todo.priority) }}>
              {formatPriority(todo.priority)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Action menu */}
      <div className="relative">
        <button onClick={() => setOpenMenu(!openMenu)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer">
          <MoreVertical size={20} />
        </button>

        {openMenu && (
          <div className="absolute right-1 w-28 bg-white border rounded-md overflow-hidden shadow-lg z-10">
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
          </div>
        )}
      </div>
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
