"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChevronDown, CircleUser, LogOut, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { useProfile } from "../context/ProfileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
          router.replace("/activitydo");
          window.history.pushState(null, "", "/activitydo");
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
    async function fetchNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    }

    fetchNotifications();

    const channel = supabase
      .channel("notification-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md text-gray-900 shadow-md z-20">
        <div className="mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo / Brand */}
          <Link href="/activitydo" className="text-xl font-bold">
            <img src="/public/logo.webp" alt="" className="w-34" />
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center">
            <Link
              href="/activitydo"
              className={`flex items-center h-16 px-7 font-medium hover:text-gray-900 ${
                pathname === "/activitydo" ? "font-semibold text-gray-900" : "text-gray-500"
              }`}
            >
              Home
            </Link>
            <Link
              href="/activitydo/todo-app"
              className={`flex items-center h-16 px-7 font-medium text-gray-500 hover:text-gray-900 ${
                pathname.startsWith("/activitydo/todo-app") ? "font-semibold text-gray-900" : ""
              }`}
            >
              Todo
            </Link>
            <Link
              href="/activitydo/dashboard"
              className={`flex items-center h-15 px-7 font-medium text-gray-500 hover:text-gray-900 ${
                pathname === "/activitydo/dashboard" ? "font-semibold text-gray-900" : ""
              }`}
            >
              Dashboard
            </Link>
          </nav>

          {/* Notification + Profile */}
          <div className="flex items-center gap-4 relative">
            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setOpenNotif((prev) => !prev)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Bell size={22} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notif */}
              {openNotif && (
                <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b font-semibold text-gray-700">Notifications</div>

                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b text-sm hover:bg-gray-100 ${!notif.read ? "bg-blue-50" : ""}`}
                      >
                        <p className="text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>

                        {notif.type === "collab_invite" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={async () => {
                                const {
                                  data: { user },
                                } = await supabase.auth.getUser();
                                if (!user) return toast.error("User not logged in");

                                // 1️⃣ Update status collab ke accepted
                                const { error: updateError } = await supabase
                                  .from("todo_collaborators")
                                  .update({ status: "accepted" })
                                  .eq("todo_id", notif.todo_id)
                                  .eq("user_id", user.id);

                                if (updateError) {
                                  console.error(updateError);
                                  toast.error("Failed to update collaboration status ❌");
                                  return;
                                }

                                // 2️⃣ Tandai notif sudah dibaca
                                await supabase.from("notifications").update({ read: true }).eq("id", notif.id);

                                // 3️⃣ Kirim notifikasi balik ke pengundang
                                await supabase.from("notifications").insert([
                                  {
                                    user_id: notif.invited_by,
                                    type: "collab_response",
                                    todo_id: notif.todo_id,
                                    message: "Your collaboration invite was accepted ✅",
                                    created_at: new Date().toISOString(),
                                  },
                                ]);

                                toast.success("Collaboration accepted!");
                                setOpenNotif(false);

                                const currentPath = window.location.pathname;
                                if (currentPath.includes("/todo-app")) {
                                  const userId = localStorage.getItem("user_id");
                                  if (userId) {
                                    const event = new CustomEvent("refreshTodos");
                                    window.dispatchEvent(event);
                                  }
                                }
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Accept
                            </button>

                            <button
                              onClick={async () => {
                                const {
                                  data: { user },
                                } = await supabase.auth.getUser();
                                if (!user) return toast.error("User not logged in");

                                // 1️⃣ Update status collab ke rejected
                                const { error: updateError } = await supabase
                                  .from("todo_collaborators")
                                  .update({ status: "rejected" })
                                  .eq("todo_id", notif.todo_id)
                                  .eq("user_id", user.id);

                                if (updateError) {
                                  console.error(updateError);
                                  toast.error("Failed to reject collaboration ❌");
                                  return;
                                }

                                // 2️⃣ Tandai notif sudah dibaca
                                await supabase.from("notifications").update({ read: true }).eq("id", notif.id);

                                // 3️⃣ Kirim notifikasi balik ke pengundang
                                await supabase.from("notifications").insert([
                                  {
                                    user_id: notif.invited_by,
                                    type: "collab_response",
                                    todo_id: notif.todo_id,
                                    message: "Your collaboration invite was declined ❌",
                                    created_at: new Date().toISOString(),
                                  },
                                ]);

                                toast.error("Collaboration declined.");
                                setOpenNotif(false);
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* ✅ Jika tipe collab_response, klik diarahkan ke todo */}
                        {notif.type === "collab_response" && (
                          <button
                            onClick={async () => {
                              await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
                              setOpenNotif(false);
                              router.push(`/activitydo/todo-app?todo=${notif.todo_id}`);
                            }}
                            className="text-blue-600 text-xs mt-2 underline"
                          >
                            View Todo
                          </button>
                        )}

                        {/* ✅ Default: klik langsung ke todo */}
                        {notif.type !== "collab_invite" && notif.type !== "collab_response" && (
                          <div
                            onClick={async () => {
                              await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
                              setOpenNotif(false);
                              router.push(`/activitydo/todo-app?todo=${notif.todo_id}`);
                            }}
                            className="mt-2 text-blue-600 text-xs underline cursor-pointer"
                          >
                            View Todo
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                className="flex items-center cursor-pointer"
                onClick={() => {
                  setOpenDropdown((prev) => !prev);
                  setOpenNotif(false);
                }}
              >
                <img
                  src={profile?.photo_profile || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-11 h-11 rounded-full border-2 border-gray-500 object-cover"
                />
                <ChevronDown
                  size={15}
                  className={`text-gray-900 ml-1 ${openDropdown ? "rotate-180" : ""} transition`}
                />
              </button>

              {openDropdown && (
                <div className="absolute right-0 mt-2 w-40 border border-gray-400 bg-white text-gray-800 rounded shadow-lg overflow-hidden z-50">
                  <Link
                    href="/activitydo/profile"
                    className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => setOpenDropdown(false)}
                  >
                    <span className="flex gap-4">
                      <CircleUser /> Profile
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-500 px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <span className="flex gap-4">
                      <LogOut size={21} className="ml-[2px]" /> Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 bg-blue-50">{children}</main>
    </div>
  );
}

// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { ChevronDown, CircleUser, LogOut, Bell } from "lucide-react";
// import toast from "react-hot-toast";
// import { useProfile } from "../context/ProfileContext";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const { profile, setProfile } = useProfile();
//   const [loading, setLoading] = useState(true);
//   const [openDropdown, setOpenDropdown] = useState(false);
//   const [openNotif, setOpenNotif] = useState(false);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const pathname = usePathname();

//   useEffect(() => {
//     async function getProfile() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) {
//         router.replace("/login");
//         return;
//       }
//       const { data: profileData } = await supabase.from("profiles").select("photo_profile").eq("id", user.id).single();
//       setProfile(profileData || null);
//       setTimeout(() => setLoading(false), 700);

//       // subscribe profile changes if needed
//       const channel = supabase
//         .channel("profile-changes")
//         .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
//           setProfile((prev) => ({ ...(prev ?? {}), ...payload.new }));
//         })
//         .subscribe();

//       window.history.pushState(null, "", window.location.href);
//       let firstBack = true;
//       const handlePopState = (e: PopStateEvent) => {
//         e.preventDefault();
//         if (firstBack) {
//           firstBack = false;
//           router.replace("/activitydo");
//           window.history.pushState(null, "", "/activitydo");
//         } else router.replace("/login");
//       };
//       window.addEventListener("popstate", handlePopState);

//       return () => {
//         supabase.removeChannel(channel);
//         window.removeEventListener("popstate", handlePopState);
//       };
//     }
//     getProfile();
//   }, [router, setProfile]);

//   // useEffect(() => {
//   //   async function fetchNotifications() {
//   //     const {
//   //       data: { user },
//   //     } = await supabase.auth.getUser();
//   //     if (!user) return;
//   //     const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
//   //     if (!error && data) {
//   //       setNotifications(data);
//   //       setUnreadCount(data.filter((n) => !n.read).length);
//   //     }
//   //   }
//   //   fetchNotifications();

//   //   const channel = supabase
//   //     .channel("notification-changes")
//   //     .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
//   //       fetchNotifications();
//   //     })
//   //     .subscribe();

//   //   return () => supabase.removeChannel(channel);
//   // }, []);

//   useEffect(() => {
//     async function fetchNotifications() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

//       if (!error && data) {
//         setNotifications(data);
//         setUnreadCount(data.filter((n) => !n.read).length);
//       }
//     }

//     fetchNotifications();

//     const channel = supabase
//       .channel("notification-changes")
//       .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
//         fetchNotifications();
//       })
//       .subscribe();

//     // ❗ cleanup tidak boleh async
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   useEffect(() => {
//     if (!loading) {
//       const justLoggedIn = localStorage.getItem("just_logged_in");
//       if (justLoggedIn) {
//         toast.success("Successfully logged in");
//         localStorage.removeItem("just_logged_in");
//       }
//     }
//   }, [loading]);

//   async function handleCollabResponse(notif: any, accept: boolean) {
//     try {
//       const newStatus = accept ? "accepted" : "rejected";
//       // only invited user should be able to update their status (RLS should protect this)
//       await supabase.from("todo_collaborators").update({ status: newStatus }).eq("todo_id", notif.todo_id).eq("user_id", notif.user_id);
//       // mark invite read
//       await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
//       // notify inviter
//       await supabase.from("notifications").insert([
//         {
//           user_id: notif.invited_by,
//           invited_by: notif.user_id,
//           todo_id: notif.todo_id,
//           type: "collab_response",
//           message: accept ? "Your collaboration invite was accepted ✅" : "Your collaboration invite was declined ❌",
//           read: false,
//           created_at: new Date().toISOString(),
//         },
//       ]);
//       toast[accept ? "success" : "error"](accept ? "Collaboration accepted!" : "Collaboration declined.");
//       setOpenNotif(false);
//     } catch (err) {
//       console.error("handleCollabResponse error:", err);
//       toast.error("Failed to respond to invite");
//     }
//   }

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.replace("/login");
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur z-20">
//         <div className="mx-auto px-6 h-16 flex items-center justify-between">
//           <Link href="/activitydo">
//             <img src="/logo.webp" alt="logo" className="h-8" />
//           </Link>
//           <nav className="flex gap-6">
//             <Link href="/activitydo" className={`${pathname === "/activitydo" ? "font-semibold" : "text-gray-500"}`}>
//               Home
//             </Link>
//             <Link href="/activitydo/todo-app" className={`${pathname.startsWith("/activitydo/todo-app") ? "font-semibold" : "text-gray-500"}`}>
//               Todo
//             </Link>
//             <Link href="/activitydo/dashboard" className={`${pathname === "/activitydo/dashboard" ? "font-semibold" : "text-gray-500"}`}>
//               Dashboard
//             </Link>
//           </nav>

//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <button onClick={() => setOpenNotif((prev) => !prev)} className="p-2 rounded-full hover:bg-gray-100">
//                 <Bell />
//                 {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
//               </button>

//               {openNotif && (
//                 <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded shadow-lg z-50">
//                   <div className="p-2 border-b font-semibold">Notifications</div>
//                   {notifications.length === 0 ? (
//                     <div className="p-3 text-center text-gray-500">No notifications</div>
//                   ) : (
//                     notifications.map((notif) => (
//                       <div key={notif.id} className={`p-3 border-b ${!notif.read ? "bg-blue-50" : ""}`}>
//                         <div className="text-sm text-gray-800">{notif.message}</div>
//                         <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>

//                         {notif.type === "collab_invite" && (
//                           <div className="flex gap-2 mt-2">
//                             <button onClick={() => handleCollabResponse(notif, true)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">
//                               Accept
//                             </button>
//                             <button onClick={() => handleCollabResponse(notif, false)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">
//                               Decline
//                             </button>
//                           </div>
//                         )}

//                         {notif.type === "collab_response" && (
//                           <button
//                             onClick={async () => {
//                               await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
//                               setOpenNotif(false);
//                               router.push(`/activitydo/todo-app?todo=${notif.todo_id}`);
//                             }}
//                             className="text-blue-600 text-xs mt-2 underline"
//                           >
//                             View Todo
//                           </button>
//                         )}

//                         {notif.type !== "collab_invite" && notif.type !== "collab_response" && (
//                           <div
//                             onClick={async () => {
//                               await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
//                               setOpenNotif(false);
//                               router.push(`/activitydo/todo-app?todo=${notif.todo_id}`);
//                             }}
//                             className="mt-2 text-blue-600 text-xs underline cursor-pointer"
//                           >
//                             View Todo
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setOpenDropdown((prev) => !prev);
//                   setOpenNotif(false);
//                 }}
//                 className="flex items-center gap-2"
//               >
//                 <img src={profile?.photo_profile || "/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
//                 <ChevronDown className={`${openDropdown ? "rotate-180" : ""} transition`} />
//               </button>
//               {openDropdown && (
//                 <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
//                   <Link href="/activitydo/profile" className="block px-4 py-2 hover:bg-gray-100">
//                     Profile
//                   </Link>
//                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="pt-20">{children}</main>
//     </div>
//   );
// }
