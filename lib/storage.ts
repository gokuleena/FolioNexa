import { Profile, starterProfile } from "./types";
import { supabase } from "./supabase";
const KEY = "folionexa.profile.v1";
export function loadProfile(): Profile {
  if (typeof window === "undefined") return starterProfile;
  try { const raw = localStorage.getItem(KEY); return raw ? { ...starterProfile, ...JSON.parse(raw) } : starterProfile; }
  catch { return starterProfile; }
}
export async function saveProfile(profile: Profile, userId?: string) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(profile));
  if (supabase && userId) {
    const { error } = await supabase.from("profiles").upsert({ id: userId, slug: profile.slug, data: profile, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}
