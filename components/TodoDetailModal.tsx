"use client";
import { Star, Clock, Tag, User, Users } from "lucide-react";

interface Todo {
  id: string;
  task: string;
  description: string;
  completed: boolean;
  favorites: boolean;
  priority: string;
  category?: { name: string };
  collaborators?: any[];
  owner?: { username: string; fullName: string; photoProfile: string };
}

export default function TodoDetailModal({ todo, onClose }: { todo: Todo; onClose: () => void }) {
  if (!todo) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 bg-blue-600 text-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold leading-tight">{todo.task}</h2>
            <div className="flex items-center gap-2 mt-2 opacity-90">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-white/30`} style={{ backgroundColor: priorityColor(todo.priority) }}>
                {todo.priority}
              </span>
              {todo.favorites && <Star className="fill-yellow-300 text-yellow-300" size={14} />}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition text-3xl font-light p-1 leading-none">&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <ClipboardList size={14} /> Deskripsi Tugas
            </label>
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 min-h-[120px] whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {todo.description || "Tidak ada deskripsi rinci untuk tugas ini."}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Tag size={14} /> Kategori
              </label>
              <div className="font-semibold text-blue-700 bg-blue-200 px-4 py-1.5 rounded-xl inline-flex items-center border border-blue-100 text-sm">
                {todo.category?.name || "Uncategorized"}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Clock size={14} /> Status Penyelesaian
              </label>
              <div className={`font-semibold px-4 py-1.5 rounded-xl inline-flex items-center text-sm ${todo.completed ? "bg-green-200 text-green-700 border border-green-100" : "bg-amber-200 text-amber-700 border border-amber-100"}`}>
                {todo.completed ? "Telah Selesai ✅" : "Masih Berjalan ⏳"}
              </div>
            </div>
          </div>

          {/* Collaborators */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Users size={14} /> Tim Kolaborasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {todo.collaborators && todo.collaborators.length > 0 ? (
                todo.collaborators.map((c: any) => (
                    <div key={c.userId} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                      <img src={c.user?.photoProfile || "/default-avatar.png"} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{c.user?.username}</p>
                        <p className={`text-[10px] font-medium ${c.status === "ACCEPTED" ? "text-green-500" : "text-amber-500"}`}>
                          {c.status}
                        </p>
                      </div>
                    </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center col-span-2">Belum ada kolaborator yang ditambahkan.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-gray-100 border border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold text-sm shadow-sm cursor-pointer">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

import { ClipboardList } from "lucide-react";

function priorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case "low": return "#10B981";
    case "medium": return "#F59E0B";
    case "high": return "#EF4444";
    default: return "#6B7280";
  }
}
