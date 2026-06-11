import { getCompanyClient } from "@/lib/db/companies";
import type {
  ActivityStatus,
  ActivityType,
  OutreachKind,
  OutreachOutcome,
  PainStatement,
} from "@/types/database";

export const activityTypeLabels: Record<ActivityType, string> = {
  note: "Notiz",
  linkedin_message: "LinkedIn Message",
  call: "Call",
  email: "E-Mail",
  meeting: "Meeting",
  task_update: "Task-Update",
};

export const outreachKindLabels: Record<OutreachKind, string> = {
  snowflake: "Snowflake",
  fire: "Fire",
  fire_plus: "Fire+",
};

export const outreachOutcomeLabels: Record<OutreachOutcome, string> = {
  no_response: "No response",
  wrong_number: "Falsche Nummer",
  gatekeeper: "Gatekeeper",
  no_time: "Keine Zeit",
  not_interested: "Kein Interesse",
  interested: "Interesse",
  follow_up_booked: "Follow-up gebucht",
};

export const painStatementLabels: Record<PainStatement, string> = {
  no_statement: "Keine Aussage",
  pain_not_identified: "Pain nicht erkannt",
  pain_identified: "Pain erkannt",
};

export type Activity = {
  id: string;
  owner_id: string;
  company_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  type: ActivityType;
  status: ActivityStatus;
  title: string;
  body: string | null;
  outreach_kind: OutreachKind | null;
  outreach_outcome: OutreachOutcome | null;
  pain_statement: PainStatement;
  value_prop_id: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export type ActivityWithContext = Activity & {
  company: {
    id: string;
    name: string;
  } | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  deal: {
    id: string;
    title: string;
  } | null;
  value_prop: {
    id: string;
    code: string;
    label: string;
  } | null;
};

const activitySelect =
  "id, owner_id, company_id, contact_id, deal_id, type, status, title, body, outreach_kind, outreach_outcome, pain_statement, value_prop_id, occurred_at, created_at, updated_at";

export async function listActivities() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      `${activitySelect}, company:companies(id, name), contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label)`,
    )
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ActivityWithContext[];
}

export async function listActivitiesForCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      `${activitySelect}, contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label)`,
    )
    .eq("company_id", companyId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ActivityWithContext[];
}

export async function listActivitiesForDeal(dealId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      `${activitySelect}, company:companies(id, name), contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label)`,
    )
    .eq("deal_id", dealId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ActivityWithContext[];
}
