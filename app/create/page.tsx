"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import CategoryDropdown from "@/components/CategoryDropdown";

export default function CreateTodoPage() {
  const [task, setTask] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | "new" | "">("");
  const [newCategory, setNewCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId);
      if (!error && data) {
        setCategories(data);
      }
    })();
  }, [userId]);

  async function handleGenerateCategory() {
    if (!userId) return toast.error("User is not logged in!");
    if (!task.trim()) return toast.error("Please enter a task first!");

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

      if (!res.ok) throw new Error(data.error || "Failed");

      const suggestion = data.category;

      if (!suggestion) return toast.error("AI did not return a category");

      const exists = categories.find((c) => c.name.toLowerCase() === suggestion.toLowerCase());

      if (exists) {
        setSelectedCategory(exists.id);
        toast.success(`AI selected existing category: ${exists.name}`);
      } else {
        const { data: newCat, error } = await supabase
          .from("categories")
          .insert([{ name: suggestion, user_id: userId }])
          .select()
          .single();

        if (error) return toast.error("Failed to create AI category ❌");

        setCategories((prev) => [...prev, newCat]);
        setSelectedCategory(newCat.id);
        toast.success(`AI created new category: ${newCat.name} 🎉`);
      }
    } catch (err) {
      console.error(err);
      toast.error("AI generation failed ❌");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return toast.error("User is not logged in!");
    if (!selectedCategory) return toast.error("Category is required ❌");

    const { error } = await supabase.from("todos").insert([
      {
        task,
        user_id: userId,
        category_id: selectedCategory,
        priority,
      },
    ]);

    if (error) {
      toast.error("Failed to create todo ❌");
    } else {
      toast.success("Todo successfully created 🎉");
      setTask("");
      setSelectedCategory("");
      setPriority("low");
    }
  }

  const handlePriorityChange = (value: string) => {
    const val = parseInt(value, 10);
    if (val === 0) setPriority("low");
    if (val === 1) setPriority("medium");
    if (val === 2) setPriority("high");
  };

  const priorityValue = priority === "low" ? 0 : priority === "medium" ? 1 : 2;

  return (
    <div className="h-screen flex items-center">
      <div className="w-130 mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Create Todo</h1>
        <p className="text-gray-600 mb-6">What activities do you want to do today?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Task</label>
            <div className="flex gap-2">
              <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="New task..." className="mt-1 border rounded w-full p-2 focus:outline-none" required />
              {/* AI Generate Button */}
              <button type="button" onClick={handleGenerateCategory} className="mt-1 px-3 py-2 border bg-blue-500 text-white font-medium font-bitcount text-md rounded hover:bg-blue-600 cursor-pointer">
                ✨AI
              </button>
            </div>
          </div>

          {/* Category dropdown */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 border rounded w-full p-2 focus:outline-none cursor-pointer"
            >
              <option value="">-- Select category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="new">+ Add new category</option>
            </select>

            {selectedCategory === "new" && (
              <div className="mt-2 flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={handleCreateCategory} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Save
                </button>
              </div>
            )}
          </div> */}
          <CategoryDropdown categories={categories} setCategories={setCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} userId={userId} />

          {/* Priority slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={2}
                step={1}
                value={priorityValue}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full accent-blue-500 focus:outline-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer">
            Add Todo
          </button>
        </form>
      </div>
    </div>
  );
}
