"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type { CompanyStatus } from "@/types/database";

const statuses: CompanyStatus[] = ["active", "inactive", "archived"];

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);
  return Number.isNaN(number) ? null : number;
}

function statusFromForm(value: FormDataEntryValue | null): CompanyStatus {
  const status = String(value ?? "active");
  return statuses.includes(status as CompanyStatus)
    ? (status as CompanyStatus)
    : "active";
}

function companyPayload(formData: FormData, ownerId: string) {
  return {
    owner_id: ownerId,
    name: requiredText(formData.get("name")),
    website: nullableText(formData.get("website")),
    industry: nullableText(formData.get("industry")),
    employee_count: nullableInteger(formData.get("employee_count")),
    status: statusFromForm(formData.get("status")),
    notes: nullableText(formData.get("notes")),
  };
}

export async function createCompany(formData: FormData) {
  const { supabase, user } = await getCompanyClient();
  const payload = companyPayload(formData, user.id);

  if (!payload.name) {
    redirect("/companies/new?error=missing_name");
  }

  const { data, error } = await supabase
    .from("companies")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/companies/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/companies");
  redirect(`/companies/${data.id}`);
}

export async function updateCompany(formData: FormData) {
  const companyId = requiredText(formData.get("company_id"));
  const { supabase, user } = await getCompanyClient();
  const payload = companyPayload(formData, user.id);

  if (!companyId) {
    redirect("/companies?error=missing_company");
  }

  if (!payload.name) {
    redirect(`/companies/${companyId}/edit?error=missing_name`);
  }

  const { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId);

  if (error) {
    redirect(
      `/companies/${companyId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function deleteCompany(formData: FormData) {
  const companyId = requiredText(formData.get("company_id"));

  if (!companyId) {
    redirect("/companies?error=missing_company");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("companies").delete().eq("id", companyId);

  if (error) {
    redirect(`/companies/${companyId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/companies");
  redirect("/companies");
}
