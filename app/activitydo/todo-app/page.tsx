"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CirclePlus, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CreateTodoModal from "@/components/CreateTodoModal";
import TodoCard from "@/components/TodoCard";
import CustomDropdown from "@/components/CustomDropdown";
import TodoDetailModal from "@/components/TodoDetailModal";
import { pusherClient } from "@/lib/pusher";
import ConfirmModal from "@/components/ConfirmModal";

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  favorites: boolean;
  priority: "low" | "medium" | "high";
  categoryId: string | null;
  category?: { id: string; name: string };
  description: string;
  ownerId: string;
  collaborators?: any[];
  position: number;
}

interface Category {
  id: string;
  name: string;
}

function TodoListContent() {
  const searchParams = useSearchParams();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "progress" | "favorites">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  // Sync filter with URL search params
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "done" || status === "progress" || status === "favorites") {
      setStatusFilter(status);
    } else {
      setStatusFilter("all");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userId) return;
    
    // Initial fetch
    const init = async () => {
        setLoading(true);
        await Promise.all([fetchTodos(userId), fetchCategories(userId)]);
        // Artificial delay for smooth transition
        setTimeout(() => setLoading(false), 600);
    };
    init();

    // Pusher for Real-time Todo Updates
    const client = pusherClient;
    if (client) {
      const channel = client.subscribe(`todos-${userId}`);
      channel.bind("todo-refresh", () => {
        fetchTodos(userId);
      });

      return () => {
        client.unsubscribe(`todos-${userId}`);
      };
    }
  }, [userId]);

  useEffect(() => {
    const handleRefresh = () => {
      const uId = localStorage.getItem("user_id");
      if (uId) fetchTodos(uId);
    };

    window.addEventListener("refreshTodos", handleRefresh);
    return () => window.removeEventListener("refreshTodos", handleRefresh);
  }, []);

  async function fetchTodos(uId: string) {
    try {
      const res = await fetch(`/api/todos?userId=${uId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const mappedTodos = (data.todos || []).map((t: any) => ({
        ...t,
        priority: t.priority?.toLowerCase() || "medium"
      })).sort((a: Todo, b: Todo) => a.position - b.position);
      setTodos(mappedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Gagal memuat data todo");
    }
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setTodos(updatedItems);

    // Save to DB
    try {
      await fetch("/api/todos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todos: updatedItems.map((t) => ({ id: t.id, position: t.position })),
        }),
      });
    } catch (error) {
      toast.error("Gagal menyimpan urutan");
    }
  };

  async function fetchCategories(uId: string) {
    try {
      const res = await fetch(`/api/categories?userId=${uId}`);
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (error) {
      console.error("Error categories:", error);
    }
  }

  async function toggleCompleted(todo: Todo) {
    const newCompleted = !todo.completed;
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (res.ok) {
        if (newCompleted) toast.success("Task completed ✅");
        if (userId) fetchTodos(userId);
      }
    } catch (error) {
      toast.error("Gagal update status");
    }
  }

  async function toggleFavorite(todo: Todo) {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites: !todo.favorites }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedTodo = {
          ...data.todo,
          priority: data.todo.priority.toLowerCase()
        };
        setTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
        toast.success(updatedTodo.favorites ? "Added to favorites." : "Removed from favorites.");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  }

  async function deleteTodo(id: string) {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task successfully deleted ✅");
        setTodos(todos.filter((t) => t.id !== id));
      }
    } catch (error) {
      toast.error("Gagal menghapus task");
    }
  }

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.task.toLowerCase().includes(search.toLowerCase()) || (todo.category?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "done" ? todo.completed : statusFilter === "progress" ? !todo.completed : statusFilter === "favorites" ? todo.favorites : true;
    const matchesCategory = categoryFilter ? todo.categoryId === categoryFilter : true;
    const matchesPriority = priorityFilter === "all" ? true : todo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <div className="max-w-7xl py-12 px-10 mx-auto mt-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold text-lg animate-pulse tracking-widest">Memuat Todo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl py-4 sm:px-10 px-4 mx-auto mt-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="lg:items-center justify-between gap-4 mb-3">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-1">Todo App</h1>
        <p className="text-gray-500 text-lg">Manage your daily tasks and stay organized</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 mt-8">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task or category..."
            className="w-full border border-blue-500 bg-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:flex-1 lg:justify-end">
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 flex-1 lg:flex-none">
            <div className="col-span-1">
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
            </div>
            <div className="col-span-1">
                <CustomDropdown
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: "", label: "All Categories" }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
                />
            </div>
            <div className="col-span-2 sm:col-span-1">
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
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="sm:w-auto w-full h-11 px-6 rounded-xl flex justify-center items-center gap-2 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <CirclePlus size={20} /> <span className="sm:hidden lg:inline">Add Task</span><span className="hidden sm:inline lg:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isBrowser ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todo-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredTodos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(draggableProvided) => (
                        <TodoCard
                          todo={todo}
                          toggleCompleted={toggleCompleted}
                          toggleFavorite={toggleFavorite}
                          deleteTodo={(id) => {
                            setTodoToDelete(id);
                            setShowDeleteModal(true);
                          }}
                          onEdit={(t) => {
                            setEditingTodo(t);
                            setShowModal(true);
                          }}
                          onView={(t) => setViewingTodo(t)}
                          provided={draggableProvided}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              toggleCompleted={toggleCompleted}
              toggleFavorite={toggleFavorite}
              deleteTodo={(id) => {
                setTodoToDelete(id);
                setShowDeleteModal(true);
              }}
              onEdit={(t) => {
                setEditingTodo(t);
                setShowModal(true);
              }}
              onView={(t) => setViewingTodo(t)}
            />
          ))
        )}
        {filteredTodos.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-xl text-gray-400 font-bold">No tasks found in this view</p>
             <p className="text-sm text-gray-400">Try changing your filters or searching for something else.</p>
          </div>
        )}
      </div>

      {viewingTodo && (
        <TodoDetailModal todo={viewingTodo as any} onClose={() => setViewingTodo(null)} />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTodoToDelete(null);
        }}
        onConfirm={() => {
          if (todoToDelete) deleteTodo(todoToDelete);
        }}
        title="Hapus Todo?"
        message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />

      <CreateTodoModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTodo(null);
        }}
        onCreated={() => {
          if (userId) fetchTodos(userId);
        }}
        categories={categories}
        setCategories={setCategories}
        editingTodo={editingTodo}
      />
    </div>
  );
}

export default function TodoListPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading...</div>}>
      <TodoListContent />
    </Suspense>
  );
}
