"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import EditProfileModal from "@/components/EditProfileModal";

interface Profile {
  full_name: string;
  username: string;
  birth_of_date: string;
  phone: string;
  bio: string;
  photo_profile: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase.from("profiles").select("full_name, username, birth_of_date, phone, bio, photo_profile").eq("id", user.id).single();

      if (!error) {
        setProfile(data as Profile);
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
    <div className="max-w-5xl mx-auto p-6 space-y-6 mt-15">
      <div>
        <h1 className="text-2xl font-semibold mb-3">My Profile</h1>

        {/* Profile Card */}
        <div className="relative flex items-center bg-white border border-blue-500 rounded-lg shadow-md p-6 space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            <Image src={profile?.photo_profile || "/default-avatar.png"} alt="Profile" width={80} height={80} className="w-full h-full object-cover aspect-square" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.full_name || "Unknown User"}</h2>
            <p className="text-gray-500">@{profile?.username || "user"}</p>
          </div>
          <button onClick={() => setOpenEdit(true)} className="flex gap-[6px] items-center px-4 py-2 ml-auto border bg-blue-500 text-white rounded-[10px] hover:bg-blue-600 text-md cursor-pointer">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mt-7">
        <h3 className="font-semibold text-2xl mb-3">Personal Information</h3>
        <div className="grid grid-cols-2 border border-blue-500 rounded-lg gap-6 p-6 shadow-md">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{profile?.full_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">@{profile?.username || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Birth of Date</p>
            <p className="font-medium">
              {profile?.birth_of_date
                ? new Date(profile.birth_of_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{profile?.phone || "-"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Bio</p>
            <p className="font-medium">{profile?.bio || "-"}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openEdit && <EditProfileModal profile={profile!} onClose={() => setOpenEdit(false)} onSave={handleSaveProfile} fetchProfile={fetchProfile} />}
    </div>
  );
}
