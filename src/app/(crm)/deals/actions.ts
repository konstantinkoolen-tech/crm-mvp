"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import {
  dealStatusForStage,
  dealStatuses,
  dealStages,
  dealValuePeriodFromForm,
} from "@/lib/deals/constants";
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
  return dealStages.includes(stage as DealStage)
    ? (stage as DealStage)
    : "lead";
}

function statusFromForm(
  value: FormDataEntryValue | null,
  stage: DealStage,
): DealStatus {
  const status = String(value ?? "");

  return dealStatuses.includes(status as DealStatus)
    ? (status as DealStatus)
    : dealStatusForStage(stage);
}

function closedAtForStatus(status: DealStatus) {
  return status === "open" ? null : new Date().toISOString();
}

function dealFields(formData: FormData) {
  const stage = stageFromForm(formData.get("stage"));
  const status = statusFromForm(formData.get("status"), stage);

  return {
    company_id: requiredText(formData.get("company_id")),
    title: requiredText(formData.get("title")),
    stage,
    status,
    value_amount: nullableNumber(formData.get("value_amount")),
    value_currency: requiredText(formData.get("value_currency")) || "EUR",
    value_period: dealValuePeriodFromForm(formData.get("value_period")),
    probability: nullableInteger(formData.get("probability")),
    expected_close_date: nullableText(formData.get("expected_close_date")),
    description: nullableText(formData.get("description")),
    closed_at: closedAtForStatus(status),
  };
}

export async function createDeal(formData: FormData) {
  const returnTo = requiredText(formData.get("return_to"));
  const { supabase, user } = await getCompanyClient();
  const payload = { ...dealFields(formData), owner_id: user.id };
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
  revalidatePath("/companies");
  revalidatePath(`/companies/${payload.company_id}`);
  redirect(successTo);
}

export async function updateDeal(formData: FormData) {
  const dealId = requiredText(formData.get("deal_id"));
  const { supabase } = await getCompanyClient();
  const payload = dealFields(formData);

  if (!dealId) {
    redirect("/deals?error=missing_deal");
  }

  if (!payload.title) {
    redirect(`/deals/${dealId}/edit?error=missing_title`);
  }

  const { error } = await supabase
    .from("deals")
    .update(payload)
    .eq("id", dealId);

  if (error) {
    redirect(
      `/deals/${dealId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/deals");
  revalidatePath("/companies");
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
  const status = dealStatusForStage(stage);
  const { error } = await supabase
    .from("deals")
    .update({
      stage,
      status,
      closed_at: closedAtForStatus(status),
    })
    .eq("id", dealId);

  if (error) {
    redirect(`/deals?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  revalidatePath("/companies");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
}

export async function moveDealToStage(
  dealId: string,
  companyId: string,
  nextStage: DealStage,
) {
  const stage = stageFromForm(nextStage);
  const status = dealStatusForStage(stage);

  if (!dealId) {
    return { ok: false, message: "Deal fehlt." };
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("deals")
    .update({
      stage,
      status,
      closed_at: closedAtForStatus(status),
    })
    .eq("id", dealId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/deals");
  revalidatePath("/companies");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }

  return { ok: true };
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
  revalidatePath("/companies");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }

  redirect("/deals");
}
