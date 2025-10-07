"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategory: string | "";
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | "">>;
  onCreateCategory: (name: string) => void;
}

export default function CategoryDropdown({ categories, setCategories, selectedCategory, setSelectedCategory, onCreateCategory }: Props) {
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  function handleAddCategory() {
    if (!newCategory.trim()) return toast.error("Category name is required");

    const exists = categories.some((c) => c.name.toLowerCase() === newCategory.trim().toLowerCase());
    if (exists) return toast.error("Category already exists");

    onCreateCategory(newCategory.trim());
    setNewCategory("");
    setAddingNew(false);
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="w-full border rounded p-2 text-left flex justify-between items-center">
        {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name || "Select category" : "Select category"}
        <span className="ml-2 text-gray-900">▼</span>
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow">
          <div className="max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${selectedCategory === cat.id ? "bg-gray-100" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpen(false);
                }}
              >
                {cat.name}
              </div>
            ))}
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-200 text-blue-600"
              onClick={() => {
                setAddingNew(true);
                setOpen(false);
              }}
            >
              + Add new category
            </div>
          </div>
        </div>
      )}

      {addingNew && (
        <div className="mt-2 flex gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name..." className="flex-1 border rounded p-2 focus:outline-none" />
          <button type="button" onClick={handleAddCategory} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
            Save
          </button>
        </div>
      )}
    </div>
  );
}
