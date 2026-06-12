"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import { dealStages } from "@/lib/db/deals";
import type { DealStage, DealStatus } from "@/types/database";

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number.parseFloat(text);
  return Number.isNaN(number) ? null : number;
}

function nullableInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);
  return Number.isNaN(number) ? null : Math.min(100, Math.max(0, number));
}

function stageFromForm(value: FormDataEntryValue | null): DealStage {
  const stage = String(value ?? "lead");
  return dealStages.includes(stage as DealStage) ? (stage as DealStage) : "lead";
}

function statusForStage(stage: DealStage): DealStatus {
  if (stage === "won") {
    return "won";
  }

  if (stage === "lost") {
    return "lost";
  }

  return "open";
}

function dealPayload(formData: FormData, ownerId: string) {
  const stage = stageFromForm(formData.get("stage"));

  return {
    owner_id: ownerId,
    company_id: requiredText(formData.get("company_id")),
    title: requiredText(formData.get("title")),
    stage,
    status: statusForStage(stage),
    value_amount: nullableNumber(formData.get("value_amount")),
    value_currency: requiredText(formData.get("value_currency")) || "EUR",
    probability: nullableInteger(formData.get("probability")),
    expected_close_date: nullableText(formData.get("expected_close_date")),
    description: nullableText(formData.get("description")),
    closed_at:
      stage === "won" || stage === "lost" ? new Date().toISOString() : null,
  };
}

export async function createDeal(formData: FormData) {
  const returnTo = requiredText(formData.get("return_to"));
  const { supabase, user } = await getCompanyClient();
  const payload = dealPayload(formData, user.id);
  const errorTo = returnTo || "/deals/new";
  const successTo = returnTo || "/deals";

  if (!payload.company_id) {
    redirect(`${errorTo}?error=missing_company`);
  }

  if (!payload.title) {
    redirect(`${errorTo}?error=missing_title`);
  }

  const { error } = await supabase.from("deals").insert(payload);

  if (error) {
    redirect(`${errorTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  revalidatePath(`/companies/${payload.company_id}`);
  redirect(successTo);
}

export async function updateDeal(formData: FormData) {
  const dealId = requiredText(formData.get("deal_id"));
  const { supabase, user } = await getCompanyClient();
  const payload = dealPayload(formData, user.id);

  if (!dealId) {
    redirect("/deals?error=missing_deal");
  }

  if (!payload.title) {
    redirect(`/deals/${dealId}/edit?error=missing_title`);
  }

  const { error } = await supabase.from("deals").update(payload).eq("id", dealId);

  if (error) {
    redirect(`/deals/${dealId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  revalidatePath(`/companies/${payload.company_id}`);
  redirect("/deals");
}

export async function updateDealStage(formData: FormData) {
  const dealId = requiredText(formData.get("deal_id"));
  const companyId = requiredText(formData.get("company_id"));
  const stage = stageFromForm(formData.get("stage"));

  if (!dealId) {
    redirect("/deals?error=missing_deal");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("deals")
    .update({
      stage,
      status: statusForStage(stage),
      closed_at:
        stage === "won" || stage === "lost" ? new Date().toISOString() : null,
    })
    .eq("id", dealId);

  if (error) {
    redirect(`/deals?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
}

export async function deleteDeal(formData: FormData) {
  const dealId = requiredText(formData.get("deal_id"));
  const companyId = requiredText(formData.get("company_id"));

  if (!dealId) {
    redirect("/deals?error=missing_deal");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("deals").delete().eq("id", dealId);

  if (error) {
    redirect(`/deals?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }

  redirect("/deals");
}
