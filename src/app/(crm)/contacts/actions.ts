"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type { ContactStatus } from "@/types/database";

const statuses: ContactStatus[] = ["active", "inactive", "archived"];

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function statusFromForm(value: FormDataEntryValue | null): ContactStatus {
  const status = String(value ?? "active");
  return statuses.includes(status as ContactStatus)
    ? (status as ContactStatus)
    : "active";
}

function contactFields(formData: FormData) {
  return {
    company_id: requiredText(formData.get("company_id")),
    first_name: requiredText(formData.get("first_name")),
    last_name: requiredText(formData.get("last_name")),
    email: nullableText(formData.get("email")),
    phone: nullableText(formData.get("phone")),
    job_title: nullableText(formData.get("job_title")),
    linkedin_url: nullableText(formData.get("linkedin_url")),
    status: statusFromForm(formData.get("status")),
    notes: nullableText(formData.get("notes")),
  };
}

export async function createContact(formData: FormData) {
  const { supabase, user } = await getCompanyClient();
  const payload = { ...contactFields(formData), owner_id: user.id };

  if (!payload.company_id) {
    redirect("/companies?error=missing_company");
  }

  if (!payload.first_name || !payload.last_name) {
    redirect(`/companies/${payload.company_id}/contacts/new?error=missing_name`);
  }

  const { error } = await supabase.from("contacts").insert(payload);

  if (error) {
    redirect(
      `/companies/${payload.company_id}/contacts/new?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/contacts");
  revalidatePath(`/companies/${payload.company_id}`);
  redirect(`/companies/${payload.company_id}`);
}

export async function updateContact(formData: FormData) {
  const contactId = requiredText(formData.get("contact_id"));
  const { supabase } = await getCompanyClient();
  const payload = contactFields(formData);

  if (!contactId) {
    redirect("/contacts?error=missing_contact");
  }

  if (!payload.first_name || !payload.last_name) {
    redirect(`/contacts/${contactId}/edit?error=missing_name`);
  }

  const { error } = await supabase
    .from("contacts")
    .update(payload)
    .eq("id", contactId);

  if (error) {
    redirect(`/contacts/${contactId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/contacts");
  revalidatePath(`/companies/${payload.company_id}`);
  redirect(`/companies/${payload.company_id}`);
}

export async function deleteContact(formData: FormData) {
  const contactId = requiredText(formData.get("contact_id"));
  const companyId = requiredText(formData.get("company_id"));

  if (!contactId) {
    redirect(companyId ? `/companies/${companyId}` : "/contacts");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);

  if (error) {
    redirect(
      companyId
        ? `/companies/${companyId}?error=${encodeURIComponent(error.message)}`
        : `/contacts?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/contacts");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
    redirect(`/companies/${companyId}`);
  }

  redirect("/contacts");
}
