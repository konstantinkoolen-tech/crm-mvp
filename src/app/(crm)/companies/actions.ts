"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  employeeCountFromForm,
  employeeCountToLegacyInteger,
} from "@/lib/companies/employee-count";
import { getCompanyClient } from "@/lib/db/companies";

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function companyFields(formData: FormData) {
  return {
    name: requiredText(formData.get("name")),
    website: nullableText(formData.get("website")),
    company_email: nullableText(formData.get("company_email")),
    phone: nullableText(formData.get("phone")),
    industry: nullableText(formData.get("industry")),
    employee_count: employeeCountFromForm(formData.get("employee_count")),
    notes: nullableText(formData.get("notes")),
  };
}

function ownerIdFromForm(formData: FormData, fallbackOwnerId: string) {
  return nullableText(formData.get("owner_id")) ?? fallbackOwnerId;
}

function legacyEmployeeCountPayload<
  T extends { employee_count: ReturnType<typeof employeeCountFromForm> },
>(
  payload: T,
) {
  return {
    ...payload,
    employee_count: employeeCountToLegacyInteger(payload.employee_count),
  };
}

function isLegacyEmployeeCountIntegerError(error: { message?: string } | null) {
  return error?.message?.includes("invalid input syntax for type integer") ?? false;
}

export async function createCompany(formData: FormData) {
  const { supabase, user } = await getCompanyClient();
  const payload = {
    ...companyFields(formData),
    owner_id: ownerIdFromForm(formData, user.id),
  };

  if (!payload.name) {
    redirect("/companies/new?error=missing_name");
  }

  let { data, error } = await supabase
    .from("companies")
    .insert(payload)
    .select("id")
    .single();

  if (isLegacyEmployeeCountIntegerError(error)) {
    ({ data, error } = await supabase
      .from("companies")
      .insert(legacyEmployeeCountPayload(payload))
      .select("id")
      .single());
  }

  if (error) {
    redirect(`/companies/new?error=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    redirect("/companies/new?error=missing_company");
  }

  revalidatePath("/companies");
  redirect(`/companies/${data.id}`);
}

export async function updateCompany(formData: FormData) {
  const companyId = requiredText(formData.get("company_id"));
  const { supabase } = await getCompanyClient();
  const ownerId = nullableText(formData.get("owner_id"));
  const payload = ownerId
    ? { ...companyFields(formData), owner_id: ownerId }
    : companyFields(formData);

  if (!companyId) {
    redirect("/companies?error=missing_company");
  }

  if (!payload.name) {
    redirect(`/companies/${companyId}/edit?error=missing_name`);
  }

  let { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId);

  if (isLegacyEmployeeCountIntegerError(error)) {
    ({ error } = await supabase
      .from("companies")
      .update(legacyEmployeeCountPayload(payload))
      .eq("id", companyId));
  }

  if (error) {
    redirect(
      `/companies/${companyId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function updateCompanyNotes(companyId: string, notes: string) {
  if (!companyId) {
    return { ok: false, message: "Unternehmen fehlt." };
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("companies")
    .update({ notes: nullableText(notes) })
    .eq("id", companyId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { ok: true };
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
