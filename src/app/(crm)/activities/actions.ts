"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type {
  ActivityType,
  OutreachKind,
  OutreachOutcome,
  PainStatement,
} from "@/types/database";

const activityTypes: ActivityType[] = [
  "note",
  "linkedin_message",
  "call",
  "email",
  "meeting",
  "task_update",
];

const outreachKinds: OutreachKind[] = ["snowflake", "fire", "fire_plus"];

const snowflakeOutcomes: OutreachOutcome[] = [
  "no_response",
  "wrong_number",
  "gatekeeper",
  "no_time",
  "not_interested",
  "interested",
  "follow_up_booked",
];

const warmOutcomes: OutreachOutcome[] = [
  "no_response",
  "no_time",
  "not_interested",
  "interested",
  "follow_up_booked",
];

const painStatements: PainStatement[] = [
  "no_statement",
  "pain_not_identified",
  "pain_identified",
];

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

function occurredAtFromForm(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  const date = text ? new Date(text) : new Date();

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function outreachKindFromForm(value: FormDataEntryValue | null) {
  const kind = String(value ?? "").trim();
  return outreachKinds.includes(kind as OutreachKind) ? (kind as OutreachKind) : null;
}

function painStatementFromForm(value: FormDataEntryValue | null): PainStatement {
  const statement = String(value ?? "no_statement").trim();
  return painStatements.includes(statement as PainStatement)
    ? (statement as PainStatement)
    : "no_statement";
}

function outcomeFromForm(
  value: FormDataEntryValue | null,
  outreachKind: OutreachKind | null,
) {
  const outcome = String(value ?? "").trim();

  if (!outreachKind) {
    return null;
  }

  const allowedOutcomes =
    outreachKind === "snowflake" ? snowflakeOutcomes : warmOutcomes;

  return allowedOutcomes.includes(outcome as OutreachOutcome)
    ? (outcome as OutreachOutcome)
    : null;
}

export async function createActivity(formData: FormData) {
  const companyId = nullableText(formData.get("company_id"));
  const contactId = nullableText(formData.get("contact_id"));
  const dealId = nullableText(formData.get("deal_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/activities";
  const title = requiredText(formData.get("title"));
  const shouldCreateTask = formData.get("create_task") === "true";
  const taskTitle = requiredText(formData.get("task_title"));
  const taskDueDate = nullableText(formData.get("task_due_date"));
  const outreachKind = outreachKindFromForm(formData.get("outreach_kind"));
  const outreachOutcome = outcomeFromForm(formData.get("outreach_outcome"), outreachKind);
  const valuePropId = outreachKind ? nullableText(formData.get("value_prop_id")) : null;

  if (!companyId && !contactId && !dealId) {
    redirect(`${returnTo}?error=missing_context`);
  }

  if (!title) {
    redirect(`${returnTo}?error=missing_title`);
  }

  if (shouldCreateTask && !taskTitle) {
    redirect(`${returnTo}?error=missing_task_title`);
  }

  if (shouldCreateTask && !taskDueDate) {
    redirect(`${returnTo}?error=missing_task_due_date`);
  }

  if (outreachKind && (!outreachOutcome || !valuePropId)) {
    redirect(`${returnTo}?error=missing_outreach_fields`);
  }

  const { supabase, user } = await getCompanyClient();
  const { error } = await supabase.from("activities").insert({
    owner_id: user.id,
    company_id: companyId,
    contact_id: contactId,
    deal_id: dealId,
    type: typeFromForm(formData.get("type")),
    status: "completed",
    title,
    body: nullableText(formData.get("body")),
    outreach_kind: outreachKind,
    outreach_outcome: outreachOutcome,
    pain_statement: painStatementFromForm(formData.get("pain_statement")),
    value_prop_id: valuePropId,
    occurred_at: occurredAtFromForm(formData.get("occurred_at")),
  });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  if (shouldCreateTask) {
    const { error: taskError } = await supabase.from("tasks").insert({
      owner_id: user.id,
      company_id: companyId,
      contact_id: contactId,
      deal_id: dealId,
      title: taskTitle,
      description: nullableText(formData.get("task_description")),
      due_date: taskDueDate,
      status: "open",
      completed_at: null,
    });

    if (taskError) {
      redirect(`${returnTo}?error=${encodeURIComponent(taskError.message)}`);
    }
  }

  revalidatePath("/activities");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
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
