"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useProfile } from "@/app/context/ProfileContext";

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: {
    full_name: string;
    username: string;
    birth_of_date: string | null;
    phone: string | null;
    bio: string | null;
    photo_profile: string | null;
  } | null;
  onClose: () => void;
  onSave: (data: any) => void;
  fetchProfile: () => Promise<void>;
}) {
  const [fullname, setFullname] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [birthDate, setBirthDate] = useState(profile?.birth_of_date || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.photo_profile || "/default-avatar.png");
  const [loading, setLoading] = useState(false);
  const { setProfile } = useProfile();

  async function handleSave() {
    setLoading(true);
    const toastId = toast.loading("Updating profile...");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.dismiss(toastId);
      toast.error("User not found");
      setLoading(false);
      return;
    }

    let photoUrl = profile?.photo_profile || null;

    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop()?.toLowerCase();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      if (profile?.photo_profile) {
        try {
          const oldPath = profile.photo_profile.split("/").slice(-2).join("/");
          await supabase.storage.from("avatars").remove([oldPath]);
        } catch (err) {
          console.warn("Failed to delete old photo:", err);
        }
      }

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, photoFile);
      if (uploadError) {
        toast.dismiss(toastId);
        toast.error("Upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      photoUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullname,
        username,
        birth_of_date: birthDate,
        phone,
        bio,
        photo_profile: photoUrl,
      })
      .eq("id", user.id)
      .select()
      .single();

    setLoading(false);
    toast.dismiss(toastId);

    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      toast.success("Profile updated ✅");
      onSave(data);
      setProfile(data); 
      onClose();
    }
  }

  function handleFileChange(file: File | null) {
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4 w-50">
            <div className="relative">
              <img src={previewUrl} alt="Avatar Preview" className="w-35 h-35 rounded-full object-cover border-2 border-gray-500" />
              <label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow">
                <Pencil size={16} />
                <input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-1 w-full">
            <div className="">
              <label className="text-sm font-medium">Fullname</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" spellCheck="false" value={fullname} onChange={(e) => setFullname(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" spellCheck="false" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Birth of Date</label>
              <input type="date" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" spellCheck="false" value={birthDate || ""} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" spellCheck="false" value={phone || ""} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" spellCheck="false" value={bio || ""} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
