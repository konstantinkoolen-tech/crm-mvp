"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";
import type {
  ActivityDirection,
  ActivityStatus,
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
const activityDirections: ActivityDirection[] = ["outbound", "inbound"];
const activityStatuses: ActivityStatus[] = ["planned", "completed", "canceled"];

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

function ownerIdFromForm(
  formData: FormData,
  fallbackOwnerId: string,
  fieldName = "owner_id",
) {
  return nullableText(formData.get(fieldName)) ?? fallbackOwnerId;
}

function typeFromForm(value: FormDataEntryValue | null): ActivityType {
  const type = String(value ?? "note");
  return activityTypes.includes(type as ActivityType)
    ? (type as ActivityType)
    : "note";
}

function directionFromForm(
  value: FormDataEntryValue | null,
): ActivityDirection {
  const direction = String(value ?? "outbound").trim();
  return activityDirections.includes(direction as ActivityDirection)
    ? (direction as ActivityDirection)
    : "outbound";
}

function statusFromForm(value: FormDataEntryValue | null): ActivityStatus {
  const status = String(value ?? "completed").trim();
  return activityStatuses.includes(status as ActivityStatus)
    ? (status as ActivityStatus)
    : "completed";
}

function occurredAtFromForm(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  const date = text
    ? parseBerlinDateTimeLocal(text) ?? new Date(text)
    : new Date();

  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function parseBerlinDateTimeLocal(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue] =
    match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = Number(hourValue);
  const minute = Number(minuteValue);
  const second = Number(secondValue ?? "0");
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcDate = new Date(utcTimestamp);
  const berlinParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(utcDate);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    Number(berlinParts.find((part) => part.type === type)?.value ?? 0);
  const berlinTimestampAtUtc = Date.UTC(
    valueFor("year"),
    valueFor("month") - 1,
    valueFor("day"),
    valueFor("hour"),
    valueFor("minute"),
    valueFor("second"),
  );
  const berlinOffset = berlinTimestampAtUtc - utcTimestamp;

  return new Date(utcTimestamp - berlinOffset);
}

function outreachKindFromForm(value: FormDataEntryValue | null) {
  const kind = String(value ?? "").trim();
  return outreachKinds.includes(kind as OutreachKind)
    ? (kind as OutreachKind)
    : null;
}

function painStatementFromForm(
  value: FormDataEntryValue | null,
): PainStatement {
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
  const allowedOutcomes =
    outreachKind === "snowflake" ? snowflakeOutcomes : warmOutcomes;

  return allowedOutcomes.includes(outcome as OutreachOutcome)
    ? (outcome as OutreachOutcome)
    : null;
}

function capturesActivityInsights(
  type: ActivityType,
  direction: ActivityDirection,
  outreachKind: OutreachKind | null,
) {
  return direction === "inbound" || requiresActivityOutcome(type, outreachKind);
}

function requiresActivityOutcome(
  type: ActivityType,
  outreachKind: OutreachKind | null,
) {
  return outreachKind !== null && (type === "call" || type === "meeting");
}

function requiresActivityValueProp(
  direction: ActivityDirection,
  outreachKind: OutreachKind | null,
) {
  return direction === "outbound" && outreachKind !== null;
}

function taskLengthError({
  description,
  title,
}: {
  description: string | null;
  title: string;
}) {
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    return "task_title_too_long";
  }

  if ((description?.length ?? 0) > TASK_DESCRIPTION_MAX_LENGTH) {
    return "task_description_too_long";
  }

  return null;
}

export async function createActivity(formData: FormData) {
  const companyId = nullableText(formData.get("company_id"));
  const contactId = nullableText(formData.get("contact_id"));
  const dealId = nullableText(formData.get("deal_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/activities";
  const title = requiredText(formData.get("title"));
  const type = typeFromForm(formData.get("type"));
  const direction = directionFromForm(formData.get("direction"));
  const shouldCreateTask = formData.get("create_task") === "true";
  const taskTitle = requiredText(formData.get("task_title"));
  const taskDescription = nullableText(formData.get("task_description"));
  const taskDueDate = nullableText(formData.get("task_due_date"));
  const submittedOutreachKind = outreachKindFromForm(
    formData.get("outreach_kind"),
  );
  const outreachKind = direction === "outbound" ? submittedOutreachKind : null;
  const capturesInsights = capturesActivityInsights(
    type,
    direction,
    outreachKind,
  );
  const outreachOutcome = capturesInsights
    ? outcomeFromForm(formData.get("outreach_outcome"), outreachKind)
    : null;
  const painStatement = capturesInsights
    ? painStatementFromForm(formData.get("pain_statement"))
    : "no_statement";
  const valuePropId =
    direction === "inbound" || outreachKind
      ? nullableText(formData.get("value_prop_id"))
      : null;
  const requiresOutcome = requiresActivityOutcome(type, outreachKind);
  const requiresValueProp = requiresActivityValueProp(direction, outreachKind);

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

  const taskLengthValidationError = shouldCreateTask
    ? taskLengthError({
        description: taskDescription,
        title: taskTitle,
      })
    : null;

  if (taskLengthValidationError) {
    redirect(`${returnTo}?error=${taskLengthValidationError}`);
  }

  if (requiresValueProp && !valuePropId) {
    redirect(`${returnTo}?error=missing_outreach_fields`);
  }

  if (requiresOutcome && !outreachOutcome) {
    redirect(`${returnTo}?error=missing_outreach_fields`);
  }

  const { supabase, user } = await getCompanyClient();
  const { error } = await supabase.from("activities").insert({
    owner_id: user.id,
    company_id: companyId,
    contact_id: contactId,
    deal_id: dealId,
    type,
    direction,
    status: "completed",
    title,
    body: nullableText(formData.get("body")),
    outreach_kind: outreachKind,
    outreach_outcome: outreachOutcome,
    pain_statement: painStatement,
    value_prop_id: valuePropId,
    occurred_at: occurredAtFromForm(formData.get("occurred_at")),
  });

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  if (shouldCreateTask) {
    const { error: taskError } = await supabase.from("tasks").insert({
      owner_id: ownerIdFromForm(formData, user.id, "task_owner_id"),
      company_id: companyId,
      contact_id: contactId,
      deal_id: dealId,
      title: taskTitle,
      description: taskDescription,
      due_date: taskDueDate,
      status: "open",
      completed_at: null,
    });

    if (taskError) {
      redirect(`${returnTo}?error=${encodeURIComponent(taskError.message)}`);
    }
  }

  revalidatePath("/activities");
  revalidatePath("/companies");
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
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  revalidatePath("/deals");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
  if (dealId) {
    revalidatePath(`/deals/${dealId}`);
  }

  redirect(returnTo);
}

export async function updateActivity(formData: FormData) {
  const activityId = requiredText(formData.get("activity_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/activities";
  const title = requiredText(formData.get("title"));
  const type = typeFromForm(formData.get("type"));
  const direction = directionFromForm(formData.get("direction"));
  const status = statusFromForm(formData.get("status"));
  const submittedOutreachKind = outreachKindFromForm(
    formData.get("outreach_kind"),
  );
  const outreachKind = direction === "outbound" ? submittedOutreachKind : null;
  const capturesInsights = capturesActivityInsights(
    type,
    direction,
    outreachKind,
  );
  const outreachOutcome = capturesInsights
    ? outcomeFromForm(formData.get("outreach_outcome"), outreachKind)
    : null;
  const painStatement = capturesInsights
    ? painStatementFromForm(formData.get("pain_statement"))
    : "no_statement";
  const valuePropId =
    direction === "inbound" || outreachKind
      ? nullableText(formData.get("value_prop_id"))
      : null;
  const requiresOutcome = requiresActivityOutcome(type, outreachKind);
  const requiresValueProp = requiresActivityValueProp(direction, outreachKind);

  if (!activityId) {
    redirect(returnTo);
  }

  if (!title) {
    redirect(`${returnTo}?error=missing_title`);
  }

  if (requiresValueProp && !valuePropId) {
    redirect(`${returnTo}?error=missing_outreach_fields`);
  }

  if (requiresOutcome && !outreachOutcome) {
    redirect(`${returnTo}?error=missing_outreach_fields`);
  }

  const { supabase, user } = await getCompanyClient();
  const { data: existingActivity, error: loadError } = await supabase
    .from("activities")
    .select("company_id, deal_id")
    .eq("id", activityId)
    .maybeSingle();

  if (loadError) {
    redirect(`${returnTo}?error=${encodeURIComponent(loadError.message)}`);
  }

  if (!existingActivity) {
    redirect(`${returnTo}?error=activity_not_found`);
  }

  const { error } = await supabase
    .from("activities")
    .update({
      type,
      direction,
      status,
      title,
      body: nullableText(formData.get("body")),
      outreach_kind: outreachKind,
      outreach_outcome: outreachOutcome,
      pain_statement: painStatement,
      value_prop_id: valuePropId,
      last_edited_by: user.id,
      occurred_at: occurredAtFromForm(formData.get("occurred_at")),
    })
    .eq("id", activityId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/activities");
  revalidatePath("/companies");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/deals");
  if (existingActivity.company_id) {
    revalidatePath(`/companies/${existingActivity.company_id}`);
  }
  if (existingActivity.deal_id) {
    revalidatePath(`/deals/${existingActivity.deal_id}`);
  }

  redirect(returnTo);
}
