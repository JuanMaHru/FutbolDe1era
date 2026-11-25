"use client";
import { useEffect, useState } from "react";
import { loadProfile, type Profile } from "@/lib/progress";
import { PROFILE_EVENT } from "@/lib/storage";

/** Perfil desde localStorage; null hasta que monta (evita desajustes de hidratación). */
export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const sync = () => setProfile(loadProfile());
    sync();
    window.addEventListener(PROFILE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROFILE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return profile;
}
