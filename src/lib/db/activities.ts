import { getCompanyClient } from "@/lib/db/companies";
import type { ActivityStatus, ActivityType } from "@/types/database";

export const activityTypeLabels: Record<ActivityType, string> = {
  note: "Notiz",
  call: "Call",
  email: "E-Mail",
  meeting: "Meeting",
  task_update: "Task-Update",
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
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export type ActivityWithContext = Activity & {
  company: {
    id: string;
    name: string;
  } | null;
  deal: {
    id: string;
    title: string;
  } | null;
};

const activitySelect =
  "id, owner_id, company_id, contact_id, deal_id, type, status, title, body, occurred_at, created_at, updated_at";

export async function listActivities() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("activities")
    .select(`${activitySelect}, company:companies(id, name), deal:deals(id, title)`)
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
    .select(`${activitySelect}, deal:deals(id, title)`)
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
    .select(`${activitySelect}, company:companies(id, name), deal:deals(id, title)`)
    .eq("deal_id", dealId)
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ActivityWithContext[];
}
