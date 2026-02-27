"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Profile = {
  fullName?: string;
  username?: string;
  email?: string;
  photoProfile?: string | null;
  // Keep these for backward compatibility during migration
  full_name?: string;
  photo_profile?: string | null;
};

type ProfileContextType = {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  return <ProfileContext.Provider value={{ profile, setProfile }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside ProfileProvider");
  return context;
}
