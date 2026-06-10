"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type { ActivityType } from "@/types/database";

const activityTypes: ActivityType[] = ["note", "call", "email", "meeting", "task_update"];

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function typeFromForm(value: FormDataEntryValue | null): ActivityType {
  const type = String(value ?? "note");
  return activityTypes.includes(type as ActivityType) ? (type as ActivityType) : "note";
}

export async function createActivity(formData: FormData) {
  const companyId = nullableText(formData.get("company_id"));
  const dealId = nullableText(formData.get("deal_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/activities";
  const title = requiredText(formData.get("title"));

  if (!companyId && !dealId) {
    redirect(`${returnTo}?error=missing_context`);
  }

  if (!title) {
    redirect(`${returnTo}?error=missing_title`);
  }

  const { supabase, user } = await getCompanyClient();
  const { error } = await supabase.from("activities").insert({
    owner_id: user.id,
    company_id: companyId,
    deal_id: dealId,
    type: typeFromForm(formData.get("type")),
    status: "completed",
    title,
    body: nullableText(formData.get("body")),
    occurred_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/activities");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
  if (dealId) {
    revalidatePath(`/deals/${dealId}`);
  }

  redirect(returnTo);
}

export async function deleteActivity(formData: FormData) {
  const activityId = requiredText(formData.get("activity_id"));
  const companyId = nullableText(formData.get("company_id"));
  const dealId = nullableText(formData.get("deal_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/activities";

  if (!activityId) {
    redirect(returnTo);
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/activities");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
  if (dealId) {
    revalidatePath(`/deals/${dealId}`);
  }

  redirect(returnTo);
}
