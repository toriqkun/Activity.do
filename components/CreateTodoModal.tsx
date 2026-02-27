"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CategoryDropdown from "@/components/CategoryDropdown";

interface Category {
  id: string;
  name: string;
}

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  favorites: boolean;
  priority: "low" | "medium" | "high";
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  };
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  editingTodo?: Todo | null;
}

export default function CreateTodoModal({ open, onClose, onCreated, categories, setCategories, editingTodo }: Props) {
  const [task, setTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [tempCategory, setTempCategory] = useState<Category | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [description, setDescription] = useState("");

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/categories?userId=${userId}`);
        const data = await res.json();
        if (res.ok) setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [userId, setCategories]);

  useEffect(() => {
    if (editingTodo) {
      setTask(editingTodo.task);
      setSelectedCategory(editingTodo.categoryId || "");
      setDescription(editingTodo.description || "");
      setPriority(editingTodo.priority);
    } else {
      setTask("");
      setSelectedCategory("");
      setDescription("");
      setPriority("low");
      setCollaborators([]);
    }
  }, [editingTodo, open]);

  useEffect(() => {
    if (open) {
      window.history.pushState({ modalOpen: true }, "");
      const handlePopState = () => onClose();
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [open, onClose]);

  async function handleGenerateDescription() {
    if (!task.trim()) return toast.error("Ketik judul task terlebih dahulu!");
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate");
      setDescription(data.description);
      toast.success("Deskripsi berhasil digenerate ✨");
    } catch (err) {
      console.error(err);
      toast.error("Gagal generate deskripsi ❌");
    } finally {
      setLoadingAI(false);
    }
  }

  async function searchUsers(query: string) {
    setSearchUser(query);
    if (!query.trim()) return setSearchResults([]);
    try {
      const res = await fetch(`/api/users/search?q=${query}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults((data.users || []).filter((u: any) => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function addCollaborator(user: any) {
    if (collaborators.some((c) => c.id === user.id)) {
      toast.error("User already added");
      return;
    }
    setCollaborators((prev) => [...prev, user]);
    setSearchResults([]);
    setSearchUser("");
  }

  function removeCollaborator(id: string) {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return toast.error("User not logged in!");
    if (!selectedCategory) return toast.error("Category is required ❌");

    try {
      let finalCategoryId = selectedCategory;

      // Handle temp category submission
      if (tempCategory && selectedCategory === tempCategory.id) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: tempCategory.name, userId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setCategories((prev) => prev.map((c) => (c.id === tempCategory.id ? data.category : c)));
        finalCategoryId = data.category.id;
        setTempCategory(null);
      }

      const todoData = {
        task,
        description,
        priority: priority.toUpperCase(),
        categoryId: finalCategoryId,
        ownerId: userId,
      };

      let todoId = editingTodo?.id;

      if (editingTodo) {
        const res = await fetch(`/api/todos/${editingTodo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todoData),
        });
        if (!res.ok) throw new Error("Gagal update todo");
        toast.success("Successfully updated todo");
      } else {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todoData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        todoId = data.todo.id;

        // Add collaborators
        for (const collab of collaborators) {
          await fetch("/api/todos/collaborate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              todoId: todoId,
              userId: collab.id,
              senderId: userId,
              taskTitle: task,
            }),
          });
        }


        toast.success(collaborators.length > 0 
          ? "Successfully created todo with collaborators 🤝" 
          : "Successfully created todo ✅");
      }

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed ❌");
    }
  }

  function handleCancel() {
    if (tempCategory) {
      setCategories((prev) => prev.filter((c) => c.id !== tempCategory.id));
      setTempCategory(null);
    }
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-130 p-6">
        <h2 className="text-xl font-bold mb-4">{editingTodo ? "Edit Todo" : "Create Todo"}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <div className="flex gap-2">
              <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="New task..." className="mt-1 border rounded w-full p-2 focus:outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <CategoryDropdown
              categories={categories}
              setCategories={setCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onCreateCategory={(name) => {
                const newCat = { id: crypto.randomUUID(), name };
                setTempCategory(newCat);
                setCategories((prev) => [...prev, newCat]);
                setSelectedCategory(newCat.id);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="mt-1 border rounded w-full p-2 focus:outline-none resize-none"
              rows={3}
            />
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={loadingAI}
              className={`block mt-1 px-3 py-2 border rounded cursor-pointer transition-all w-full items-center justify-center gap-2 ${
                loadingAI ? "bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loadingAI ? <span className="animate-pulse">Generating...</span> : "Generate Description with AI ✨"}
            </button>
          </div>

          {!editingTodo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collaborators</label>
              <input value={searchUser} onChange={(e) => searchUsers(e.target.value)} placeholder="Search by username..." className="border rounded w-full p-2 focus:outline-none" />
              {searchResults.length > 0 && (
                <div className="border rounded mt-1 bg-white shadow max-h-40 overflow-y-auto z-10">
                  {searchResults.map((user) => (
                    <div key={user.id} onClick={() => addCollaborator(user)} className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-xs text-gray-500">{user.fullName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center gap-1 bg-gray-300 px-4 py-0.5 rounded-full text-md">
                      <span className="font-medium">{c.username}</span>
                      <button onClick={() => removeCollaborator(c.id)} type="button" className="font-bold text-lg text-red-500 cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex justify-between gap-2">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as any)}
                  className={`flex-1 py-1.5 rounded text-sm capitalize cursor-pointer ${priority === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 border border-gray-400"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancel} className="px-5 py-2 rounded bg-gray-100 text-gray-600 border border-gray-400 hover:bg-gray-200 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 cursor-pointer">
              {editingTodo ? "Update" : "Add Todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
