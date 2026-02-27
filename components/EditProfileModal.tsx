"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useProfile } from "@/app/context/ProfileContext";

interface ProfileData {
  fullName: string;
  username: string;
  birthOfDate: string | null;
  phone: string | null;
  bio: string | null;
  photoProfile: string | null;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileData | null;
  onClose: () => void;
  onSave: (data: any) => void;
  fetchProfile: () => Promise<void>;
}) {
  const [fullname, setFullname] = useState(profile?.fullName || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [birthDate, setBirthDate] = useState(profile?.birthOfDate ? new Date(profile.birthOfDate).toISOString().split('T')[0] : "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.photoProfile || "/default-avatar.png");
  const [loading, setLoading] = useState(false);
  const { setProfile } = useProfile();

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "activity_do");
    formData.append("cloud_name", "dy1njrkqd");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dy1njrkqd/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    }
  }

  async function handleSave() {
    setLoading(true);
    const toastId = toast.loading("Updating profile...");

    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast.dismiss(toastId);
        toast.error("User not found");
        setLoading(false);
        return;
      }

      let photoUrl = profile?.photoProfile || null;

      if (photoFile) {
        try {
          photoUrl = await uploadToCloudinary(photoFile);
        } catch {
          toast.dismiss(toastId);
          toast.error("Upload to Cloudinary failed");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName: fullname,
          username,
          birthOfDate: birthDate,
          phone,
          bio,
          photoProfile: photoUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.dismiss(toastId);
      toast.success("Profile updated ✅");
      
      const updatedProfile = {
        fullName: data.user.fullName,
        username: data.user.username,
        photo_profile: data.user.photoProfile, // Keep compatibility for context if needed
        photoProfile: data.user.photoProfile,
      };

      onSave(data.user);
      setProfile(updatedProfile as any);
      onClose();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
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
          <div className="flex flex-col items-center space-y-4 w-50">
            <div className="relative">
              <img src={previewUrl} alt="Avatar Preview" className="w-35 h-35 rounded-full object-cover border-2 border-gray-500" />
              <label htmlFor="photoUpload" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow">
                <Pencil size={16} />
                <input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <div>
              <label className="text-sm font-medium">Fullname</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" value={fullname} onChange={(e) => setFullname(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Birth of Date</label>
              <input type="date" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" value={birthDate || ""} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" value={phone || ""} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea className="w-full border rounded px-3 py-2 mt-1 focus:outline-none" value={bio || ""} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
        </div>

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
