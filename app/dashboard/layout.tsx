"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useProfile } from "../context/ProfileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase.from("profiles").select("photo_profile").eq("id", user.id).single();

      setProfile(profileData || null);
      setTimeout(() => {
        setLoading(false);
      }, 900);

      const channel = supabase
        .channel("profile-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile((prev) => ({
              ...(prev ?? {}),
              ...payload.new,
            }));
          }
        )
        .subscribe();

      let firstBack = true;
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        if (firstBack) {
          firstBack = false;
          router.replace("/dashboard");
          window.history.pushState(null, "", "/dashboard");
        } else {
          router.replace("/login");
        }
      };

      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener("popstate", handlePopState);
      };
    }

    getProfile();
  }, [router, setProfile]);

  useEffect(() => {
    if (!loading) {
      const justLoggedIn = localStorage.getItem("just_logged_in");
      if (justLoggedIn) {
        toast.success("Successfully logged in");
        localStorage.removeItem("just_logged_in");
      }
    }
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center h-screen bg-gray-200">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gray-800 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
        <p className="text-gray-800 text-lg font-medium ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md text-gray-900 shadow-md z-10">
        <div className="mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="text-xl font-bold">
            <img src="/logo.webp" alt="" className="w-34" />
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center">
            <Link href="/dashboard" className={`flex items-center h-15 px-7 font-medium text-gray-500 hover:text-gray-900 ${pathname === "/dashboard" ? "font-semibold text-gray-900" : ""}`}>
              Dashboard
            </Link>
            <Link
              href="/dashboard/todo-app"
              className={`flex items-center h-16 px-7 font-medium text-gray-500 hover:text-gray-900 ${pathname.startsWith("/dashboard/todo-app") ? "font-semibold text-gray-900" : ""}`}
            >
              Todo
            </Link>
          </nav>

          {/* Profile */}
          <div className="relative">
            <button className="flex items-center cursor-pointer" onClick={() => setOpenDropdown((prev) => !prev)}>
              <img src={profile?.photo_profile || "/default-avatar.png"} alt="Avatar" className="w-11 h-11 rounded-full border-2 border-gray-500 object-cover" />
              <ChevronDown size={15} className={`text-gray-900 ml-1 ${openDropdown ? "rotate-180" : ""} transition`} />
            </button>

            {openDropdown && (
              <div className="absolute right-0 mt-2 w-35 border bg-white text-gray-800 rounded shadow-lg overflow-hidden z-50">
                <Link href="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => setOpenDropdown(false)}>
                  <span className="flex gap-3">
                    <CircleUser /> Profile
                  </span>
                </Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-500 px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  <span className="flex gap-3">
                    <LogOut /> Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 bg-blue-50">{children}</main>
    </div>
  );
}
