import { getCompanyClient } from "@/lib/db/companies";
import type { ListOwner } from "@/lib/db/companies";
import {
  activityDirectionLabels,
  activityTypeLabels,
  outreachKindLabels,
  outreachOutcomeLabels,
  painStatementLabels,
} from "@/lib/activities/constants";
import type {
  ActivityDirection,
  ActivityStatus,
  ActivityType,
  OutreachKind,
  OutreachOutcome,
  PainStatement,
} from "@/types/database";

export {
  activityDirectionLabels,
  activityTypeLabels,
  outreachKindLabels,
  outreachOutcomeLabels,
  painStatementLabels,
};

export type Activity = {
  id: string;
  owner_id: string;
  company_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  type: ActivityType;
  direction: ActivityDirection;
  status: ActivityStatus;
  title: string;
  body: string | null;
  outreach_kind: OutreachKind | null;
  outreach_outcome: OutreachOutcome | null;
  pain_statement: PainStatement;
  value_prop_id: string | null;
  last_edited_by: string | null;
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
  owner: ListOwner | null;
  last_editor: ListOwner | null;
};

const activitySelect =
  "id, owner_id, company_id, contact_id, deal_id, type, direction, status, title, body, outreach_kind, outreach_outcome, pain_statement, value_prop_id, last_edited_by, occurred_at, created_at, updated_at";

export async function listActivities() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("activities")
    .select(
      `${activitySelect}, company:companies(id, name), contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label), owner:profiles!activities_owner_id_fkey(id, email, full_name, display_name), last_editor:profiles!activities_last_edited_by_fkey(id, email, full_name, display_name)`,
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
      `${activitySelect}, company:companies(id, name), contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label), owner:profiles!activities_owner_id_fkey(id, email, full_name, display_name), last_editor:profiles!activities_last_edited_by_fkey(id, email, full_name, display_name)`,
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
      `${activitySelect}, company:companies(id, name), contact:contacts(id, first_name, last_name), deal:deals(id, title), value_prop:value_props(id, code, label), owner:profiles!activities_owner_id_fkey(id, email, full_name, display_name), last_editor:profiles!activities_last_edited_by_fkey(id, email, full_name, display_name)`,
    )
    .eq("deal_id", dealId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ActivityWithContext[];
}
