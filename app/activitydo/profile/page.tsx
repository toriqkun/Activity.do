"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import EditProfileModal from "@/components/EditProfileModal";

interface Profile {
  fullName: string;
  email: string;
  username: string;
  birthOfDate: string;
  phone: string;
  bio: string;
  photoProfile: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const res = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await res.json();

      if (data.user) {
        setProfile(data.user as Profile);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  function handleSaveProfile(updated: Profile) {
    setProfile(updated);
  }

  return (
    <div className="max-w-5xl mx-auto sm:p-10 p-4 space-y-8 mt-15 min-h-[calc(100vh-64px)] animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6 px-2">My Profile</h1>

        {/* Profile Card */}
        <div className="relative flex flex-col sm:flex-row items-center bg-white border border-gray-100 rounded-3xl shadow-xl shadow-blue-500/5 p-6 sm:p-8 gap-6 transition-all hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-blue-50 shadow-inner">
            <Image 
              src={profile?.photoProfile || "/default-avatar.png"} 
              alt="Profile" 
              width={112} 
              height={112} 
              className="w-full h-full object-cover aspect-square transition-transform hover:scale-110 duration-500" 
            />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{profile?.fullName || "Loading..."}</h2>
            <p className="text-blue-600 font-semibold">@{profile?.username || "user"}</p>
            <p className="text-gray-400 text-sm mt-1">{profile?.email}</p>
          </div>
          <button 
            onClick={() => setOpenEdit(true)} 
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="px-2">
        <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-100 rounded-3xl gap-6 p-6 sm:p-8 shadow-xl shadow-blue-500/5 transition-all hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
            <p className="font-semibold text-gray-700 truncate">{profile?.email || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
            <p className="font-semibold text-gray-700">{profile?.fullName || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Username</p>
            <p className="font-semibold text-gray-700">@{profile?.username || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
            <p className="font-semibold text-gray-700">
              {profile?.birthOfDate
                ? new Date(profile.birthOfDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
            <p className="font-semibold text-gray-700">{profile?.phone || "-"}</p>
          </div>
          <div className="md:col-span-2 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio</p>
            <p className="font-semibold text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
              {profile?.bio || "No bio available."}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openEdit && <EditProfileModal profile={profile!} onClose={() => setOpenEdit(false)} onSave={handleSaveProfile} fetchProfile={fetchProfile} />}
    </div>
  );
}
