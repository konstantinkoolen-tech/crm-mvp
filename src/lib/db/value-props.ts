import { getCompanyClient } from "@/lib/db/companies";

export type ValueProp = {
  id: string;
  owner_id: string;
  code: string;
  label: string;
  description: string | null;
  status: "active" | "archived";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function listActiveValueProps() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("value_props")
    .select("id, owner_id, code, label, description, status, sort_order, created_at, updated_at")
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ValueProp[];
}

export async function listValuePropsForSettings() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("value_props")
    .select("id, owner_id, code, label, description, status, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ValueProp[];
}

export async function getCurrentProfile() {
  const { supabase, user } = await getCompanyClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    id: string;
    email: string | null;
    role: string | null;
    status: "active" | "inactive";
  };
}

export async function requireAdminProfile() {
  const profile = await getCurrentProfile();

  if (profile.role !== "admin" || profile.status !== "active") {
    throw new Error("Nur Admins koennen diese Einstellung aendern.");
  }

  return profile;
}
