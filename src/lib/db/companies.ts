import { notFound, redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { CompanyStatus } from "@/types/database";

export type Company = {
  id: string;
  owner_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  employee_count: number | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCompanyClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(supabase, user);

  return { supabase, user };
}

export async function listCompanies() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, owner_id, name, website, industry, employee_count, status, notes, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Company[];
}

export async function getCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, owner_id, name, website, industry, employee_count, status, notes, created_at, updated_at",
    )
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as Company;
}
