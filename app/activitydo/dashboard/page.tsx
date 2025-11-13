"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ClipboardList, CheckCircle, Clock, Star } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    all: 0,
    progress: 0,
    done: 0,
    favorites: 0,
  });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    (async () => {
      const { data } = await supabase.from("todos").select("*").eq("user_id", userId);

      if (data) {
        const all = data.length;
        const done = data.filter((t) => t.completed).length;
        const progress = data.filter((t) => !t.completed).length;
        const favorites = data.filter((t) => t.favorites).length;

        setStats({ all, progress, done, favorites });
      }
    })();
  }, []);

  const cards = [
    {
      title: "All Todos",
      count: stats.all,
      color: "bg-blue-600",
      icon: <ClipboardList className="w-13 h-13 text-[#494646b8]" />,
      href: "/dashboard/todo-app",
    },
    {
      title: "Progress",
      count: stats.progress,
      color: "bg-yellow-500",
      icon: <Clock className="w-13 h-13 text-[#494646b8]" />,
      href: "/dashboard/todo-app?status=progress",
    },
    {
      title: "Done",
      count: stats.done,
      color: "bg-green-600",
      icon: <CheckCircle className="w-13 h-13 text-[#494646b8]" />,
      href: "/dashboard/todo-app?status=done",
    },
    {
      title: "Favorites",
      count: stats.favorites,
      color: "bg-red-600",
      icon: <Star className="w-13 h-13 text-[#494646b8]" />,
      href: "/dashboard/todo-app?status=favorites",
    },
  ];

  return (
    <div className="max-w-6xl items-center mx-auto mt-20">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-lg text-gray-500 ml-[2px] mb-8">Check your todo list, based on all, progress, completed, and favorites.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className={`${card.color} relative overflow-hidden rounded p-4 shadow-lg text-white`}>
            <div className="flex justify-between">
              <div className="h-28">
                <p className="text-3xl font-bold">{card.count}</p>
                <p className="text-lg">{card.title}</p>
              </div>
              <span className="mt-1">{card.icon}</span>
            </div>
            <Link href={card.href} className="absolute flex gap-1 justify-center bottom-0 left-0 w-full mt-4 bg-black/20 px-3 py-1 hover:bg-[#ffffff30] text-sm items-center">
              Selengkapnya <span className="mt-[2px]">➯</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
