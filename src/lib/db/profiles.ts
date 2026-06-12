import { getCompanyClient } from "@/lib/db/companies";
import type { ProfileStatus } from "@/types/database";

export type ProfileRole = "admin" | "member" | string;

export type TeamProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: ProfileRole | null;
  status: ProfileStatus;
  can_create_deals: boolean;
  can_create_companies: boolean;
  can_delete_companies: boolean;
  can_manage_users: boolean;
  can_manage_settings: boolean;
  created_at: string;
  updated_at: string;
};

const profileSelect =
  "id, email, full_name, display_name, avatar_url, role, status, can_create_deals, can_create_companies, can_delete_companies, can_manage_users, can_manage_settings, created_at, updated_at";

export function displayNameForProfile(profile: Pick<TeamProfile, "display_name" | "full_name" | "email">) {
  return (
    profile.display_name?.trim() ||
    profile.full_name?.trim() ||
    profile.email?.split("@")[0] ||
    "Unbekannter Nutzer"
  );
}

export async function getCurrentProfile() {
  const { supabase, user } = await getCompanyClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TeamProfile;
}

export async function requireAdminProfile() {
  const profile = await getCurrentProfile();

  if (profile.role !== "admin" || profile.status !== "active") {
    throw new Error("Nur Admins können diese Einstellung ändern.");
  }

  return profile;
}

export async function listTeamProfiles() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .order("role", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TeamProfile[];
}
