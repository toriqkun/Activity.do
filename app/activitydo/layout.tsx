"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useProfile } from "../context/ProfileContext";
import NotificationBell from "@/components/NotificationBell";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.replace("/login");
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/profile?userId=${userId}`);
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch profile in layout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    let firstBack = true;
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (firstBack) {
        firstBack = false;
        router.replace("/activitydo");
        window.history.pushState(null, "", "/activitydo");
      } else {
        router.replace("/login");
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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

  useEffect(() => {
    // Close menu when pathname changes
    setIsMenuOpen(false);
    setOpenDropdown(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
    toast.success("Successfully logged out");
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
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg text-gray-900 shadow-sm z-50 transition-all border-b border-gray-100">
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl">
          {/* Logo / Brand */}
          <Link href="/activitydo" className="text-xl font-bold flex-shrink-0">
            <img src="/logo.webp" alt="logo" className="w-32 sm:w-34" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center h-full">
            <Link
              href="/activitydo"
              className={`flex items-center h-16 px-6 font-semibold transition-colors hover:text-blue-600 ${
                pathname === "/activitydo" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              Home
            </Link>
            <Link
              href="/activitydo/todo-app"
              className={`flex items-center h-16 px-6 font-semibold transition-colors hover:text-blue-600 ${
                pathname.startsWith("/activitydo/todo-app") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              Todo
            </Link>
            <Link
              href="/activitydo/dashboard"
              className={`flex items-center h-16 px-6 font-semibold transition-colors hover:text-blue-600 ${
                pathname === "/activitydo/dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              Dashboard
            </Link>
          </nav>

          {/* Right Section: Notification, Profile, Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell userId={typeof window !== "undefined" ? localStorage.getItem("user_id") || "" : ""} />

            {/* Profile Avatar Desktop */}
            <div className="hidden sm:block relative">
              <button
                className="flex items-center cursor-pointer group"
                onClick={() => setOpenDropdown((prev) => !prev)}
              >
                <img
                  src={profile?.photoProfile || profile?.photo_profile || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 object-cover"
                />
                <ChevronDown
                  size={14}
                  className={`text-gray-500 ml-1.5 transition-transform duration-200 group-hover:text-blue-600 ${openDropdown ? "rotate-180 text-blue-600" : ""}`}
                />
              </button>

              {openDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 text-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{profile?.fullName || "User"}</p>
                  </div>
                  <Link
                    href="/activitydo/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition text-gray-700"
                    onClick={() => setOpenDropdown(false)}
                  >
                    <CircleUser size={18} className="text-gray-400" /> My Profile
                  </Link>
                  <div className="h-px bg-gray-50 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut size={18} className="text-red-400" /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Button (Tablet/Mobile) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
            >
               {isMenuOpen ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
               )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-2">
               <div className="sm:hidden flex items-center gap-4 p-3 bg-gray-50 rounded-2xl mb-2">
                  <img
                    src={profile?.photoProfile || profile?.photo_profile || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{profile?.fullName || "User"}</p>
                    <p className="text-xs text-gray-400">@{profile?.username}</p>
                  </div>
               </div>
               
               <Link 
                 href="/activitydo" 
                 className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${pathname === "/activitydo" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
               >
                 Home
               </Link>
               <Link 
                 href="/activitydo/todo-app" 
                 className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${pathname.startsWith("/activitydo/todo-app") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
               >
                 Todo App
               </Link>
               <Link 
                 href="/activitydo/dashboard" 
                 className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${pathname === "/activitydo/dashboard" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
               >
                 Dashboard
               </Link>
               
               <div className="h-px bg-gray-100 my-2"></div>
               
               <Link 
                 href="/activitydo/profile" 
                 className={`flex items-center gap-3 p-3 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition sm:hidden`}
               >
                 <CircleUser size={20} className="text-gray-400" /> Profile
               </Link>
               <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl font-bold text-red-500 hover:bg-red-100 transition cursor-pointer lg:hidden"
               >
                 <LogOut size={20} className="text-red-400" /> Logout
               </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 bg-blue-50/50 pt-16">{children}</main>
    </div>
  );
}
