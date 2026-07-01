import { notFound, redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth/profile";
import type { CompanyEmployeeCountValue } from "@/lib/companies/employee-count";
import { createClient } from "@/lib/supabase/server";
import type { CompanyStatus } from "@/types/database";

export type Company = {
  id: string;
  owner_id: string;
  name: string;
  website: string | null;
  company_email: string | null;
  phone: string | null;
  industry: string | null;
  employee_count: CompanyEmployeeCountValue;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ListOwner = {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
};

export type CompanyWithOwner = Company & {
  owner: ListOwner | null;
};

const companyBaseSelect =
  "id, owner_id, name, website, company_email, phone, industry, employee_count, status, notes, created_at, updated_at";

const companyWithOwnerSelect = `${companyBaseSelect}, owner:profiles!companies_owner_id_fkey(id, email, full_name, display_name)`;

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
    .select(companyWithOwnerSelect)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CompanyWithOwner[];
}

export async function getCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("companies")
    .select(companyWithOwnerSelect)
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as unknown as CompanyWithOwner;
}
