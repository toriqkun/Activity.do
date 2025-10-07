"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
  };
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

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from("categories").select("*").eq("user_id", userId);
      if (data) setCategories(data);
    })();
  }, [userId]);

  useEffect(() => {
    if (editingTodo) {
      setTask(editingTodo.task);
      setSelectedCategory(editingTodo.category_id || "");
      setPriority(editingTodo.priority);
    } else {
      setTask("");
      setSelectedCategory("");
      setPriority("low");
    }
  }, [editingTodo, open]);

  useEffect(() => {
    if (open) {
      window.history.pushState({ modalOpen: true }, "");

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [open, onClose]);

  async function handleGenerateCategory() {
    if (!userId) return toast.error("User is not logged in!");
    if (!task.trim()) return toast.error("Please enter a task first!");
    setLoadingAI(true);

    try {
      const res = await fetch("/api/generate-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          categories: categories.map((c) => c.name),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          return toast.error("AI quota limit reached, please try again later!");
        }
        throw new Error(data.error || "Failed");
      }

      const suggestion = data.category;
      if (!suggestion) return toast.error("AI did not return a category");

      const exists = categories.find((c) => c.name.toLowerCase() === suggestion.toLowerCase());

      if (exists) {
        setSelectedCategory(exists.id);
        toast.success(`AI selected existing category: ${exists.name}`);
      } else {
        if (editingTodo) {
          toast.error("Cannot generate new category when updating todo");
          return;
        }
        const newCat: Category = { id: crypto.randomUUID(), name: suggestion };
        setTempCategory(newCat);
        setCategories((prev) => [...prev, newCat]);
        setSelectedCategory(newCat.id);
        toast.success(`AI suggested new category: ${newCat.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("AI generation failed ❌");
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return toast.error("User not logged in!");
    if (!selectedCategory) return toast.error("Category is required ❌");

    if (editingTodo?.completed) {
      return toast.error("Cannot edit a completed todo ❌");
    }

    try {
      let finalCategoryId = selectedCategory;
      if (tempCategory && selectedCategory === tempCategory.id) {
        const { data: newCat, error: catErr } = await supabase
          .from("categories")
          .insert([{ name: tempCategory.name, user_id: userId }])
          .select()
          .single();

        if (catErr) throw catErr;

        setCategories((prev) => prev.map((c) => (c.id === tempCategory.id ? newCat : c)));
        finalCategoryId = newCat.id;
        setTempCategory(null);
      }

      if (editingTodo) {
        const { error } = await supabase
          .from("todos")
          .update({
            task,
            category_id: finalCategoryId,
            priority,
            completed: editingTodo.completed,
          })
          .eq("id", editingTodo.id);

        if (error) throw error;
        toast.success("Successfully updated todo");
      } else {
        const { error } = await supabase.from("todos").insert([
          {
            task,
            user_id: userId,
            category_id: finalCategoryId,
            priority,
            completed: false,
          },
        ]);

        if (error) throw error;
        toast.success("Successfully created todo");
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

  const handlePriorityChange = (val: string) => {
    setPriority(val === "0" ? "low" : val === "1" ? "medium" : "high");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[450px] p-6">
        <h2 className="text-xl font-bold mb-4">Create Todo</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <div className="flex gap-2">
              <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="New task..." className="mt-1 border rounded w-full p-2 focus:outline-none" required />
              {/* AI Generate Button */}
              <button
                type="button"
                onClick={handleGenerateCategory}
                disabled={loadingAI || editingTodo?.completed}
                title="This AI is to generate categories based on activity name."
                className={`mt-1 px-3 py-2 border rounded cursor-pointer flex items-center justify-center ${loadingAI ? "bg-gray-300 text-gray-500" : "bg-gray-100 hover:bg-[#dcdcdc] text-black"}`}
              >
                {loadingAI ? (
                  <span className="flex space-x-1">
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></span>
                  </span>
                ) : (
                  "✨AI"
                )}
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
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
                toast.success(`Category ${name} successfully added (pending)`);
              }}
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={priority === "low" ? 0 : priority === "medium" ? 1 : 2}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full accent-blue-500 focus:outline-none cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-1 text-gray-600">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700 cursor-pointer">
              {editingTodo ? "Update" : "Add Todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
