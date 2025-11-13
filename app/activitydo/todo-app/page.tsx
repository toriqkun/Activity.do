"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CirclePlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import CreateTodoModal from "@/components/CreateTodoModal";
import TodoCard from "@/components/TodoCard";
import CustomDropdown from "@/components/CustomDropdown";

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  favorites: boolean;
  priority: "low" | "medium" | "high";
  category_id: string | null;
  category?: { id: string; name: string };
  description: string;
}

interface Category {
  id: string;
  name: string;
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "progress" | "favorites">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    if (!userId) return;
    fetchTodos(userId);
    fetchCategories(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("realtime_todos")
      .on("postgres_changes", { event: "*", schema: "public", table: "todo_collaborators" }, (payload) => {
        console.log("Realtime update:", payload);
        fetchTodos(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const handleRefresh = () => {
      const userId = localStorage.getItem("user_id");
      if (userId) fetchTodos(userId);
    };

    window.addEventListener("refreshTodos", handleRefresh);
    return () => window.removeEventListener("refreshTodos", handleRefresh);
  }, []);

  // async function fetchTodos(userId: string) {
  //   const { data, error } = await supabase
  //     .from("todos")
  //     .select(
  //       `
  //     *,
  //     category:categories(id, name),
  //     todo_collaborators!inner (
  //       user_id,
  //       status
  //     )
  //   `
  //     )
  //     .or(`user_id.eq.${userId},todo_collaborators.user_id.eq.${userId}`)
  //     .eq("todo_collaborators.status", "accepted")
  //     .order("created_at", { ascending: false });

  //   if (error) {
  //     console.error("Error fetching todos:", error.message);
  //     return;
  //   }

  //   console.log("Fetched todos:", data);
  //   setTodos(data as Todo[]);
  // }

  async function fetchTodos(userId: string) {
    const { data, error } = await supabase
      .from("todos")
      .select(
        `
      *,
      category:categories(id, name),
      todo_collaborators(user_id, status)
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error.message);
      toast.error("Gagal memuat data todo");
      return;
    }

    // ✅ Filter manual di sisi client
    const filtered = (data || []).filter((todo: any) => {
      const isOwner = todo.user_id === userId;
      const isAcceptedCollab = todo.todo_collaborators?.some((c: any) => c.user_id === userId && c.status === "accepted");
      return isOwner || isAcceptedCollab;
    });

    setTodos(filtered as Todo[]);
  }

  async function fetchCategories(userId: string) {
    const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId);

    if (!error && data) {
      setCategories(data);
    }
  }

  async function toggleCompleted(todo: Todo) {
    const newCompleted = !todo.completed;

    const { error } = await supabase.from("todos").update({ completed: newCompleted }).eq("id", todo.id);

    if (!error) {
      if (newCompleted) {
        toast.success("Task completed ✅");
      }
      const userId = localStorage.getItem("user_id");
      if (userId) fetchTodos(userId);
    }
  }

  async function toggleFavorite(todo: Todo) {
    const { data, error } = await supabase.from("todos").update({ favorites: !todo.favorites }).eq("id", todo.id).select().single();

    if (!error && data) {
      setTodos((prev) => prev.map((t) => (t.id === data.id ? data : t)));

      if (data.favorites) {
        toast.success("Added to favorites.");
      } else {
        toast.success("Removed from favorites.");
      }
    } else if (error) {
      toast.error("Failed to update favorites");
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) {
      toast.success("Task successfully deleted ✅");
      setTodos(todos.filter((t) => t.id !== id));
    }
  }

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.task.toLowerCase().includes(search.toLowerCase()) || (todo.category?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "done" ? todo.completed : statusFilter === "progress" ? !todo.completed : statusFilter === "favorites" ? todo.favorites : true;

    const matchesCategory = categoryFilter ? todo.category?.id === categoryFilter : true;

    const matchesPriority = priorityFilter === "all" ? true : todo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="max-w-7xl py-4 px-10 mx-auto mt-14">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 mt-15">
        {/* Search */}
        <div className="relative w-full flex">
          <span className="absolute top-2 left-2 text-gray-400">
            <Search />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by task name or category..."
            className="border border-blue-500 bg-white rounded pl-10 pr-3 py-2 w-[330px] focus:outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-8">
          <div className="flex gap-4">
            {/* Status Filter */}
            <CustomDropdown
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              options={[
                { value: "all", label: "All Status" },
                { value: "done", label: "Done" },
                { value: "progress", label: "Progress" },
                { value: "favorites", label: "Favorites" },
              ]}
            />

            {/* Category Filter */}
            <CustomDropdown
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ value: "", label: "All Categories" }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
            />

            {/* Priority Filter */}
            <CustomDropdown
              label="Priority"
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val as any)}
              options={[
                { value: "all", label: "All Priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </div>

          <button onClick={() => setShowModal(true)} className="w-20 h-11 rounded-[6px] flex justify-center items-center gap-2 font-medium text-white bg-blue-600 cursor-pointer">
            <CirclePlus size={20} /> Add
          </button>
        </div>
      </div>
      {/* List in Cards */}
      <div className="mt-4">
        {filteredTodos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            toggleCompleted={toggleCompleted}
            toggleFavorite={toggleFavorite}
            deleteTodo={deleteTodo}
            onEdit={(t) => {
              setEditingTodo(t);
              setShowModal(true);
            }}
          />
        ))}

        {filteredTodos.length === 0 && <p className="text-center text-lg text-gray-600 py-6">No todos found</p>}
      </div>

      {/* Modal Create Todo */}
      <CreateTodoModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTodo(null);
        }}
        onCreated={() => {
          const userId = localStorage.getItem("user_id");
          if (userId) fetchTodos(userId);
        }}
        categories={categories}
        setCategories={setCategories}
        editingTodo={editingTodo}
      />
    </div>
  );
}

// function priorityColor(priority: "low" | "medium" | "high") {
//   switch (priority) {
//     case "low":
//       return "#16A34A";
//     case "medium":
//       return "#FACC15";
//     case "high":
//       return "#DC2626";
//     default:
//       return "#6B7280";
//   }
// }
