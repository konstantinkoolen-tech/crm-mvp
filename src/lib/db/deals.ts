import { notFound } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import { dealStageLabels, dealStages } from "@/lib/deals/constants";
import type { DealStage, DealStatus, DealValuePeriod } from "@/types/database";

export { dealStageLabels, dealStages };

export type Deal = {
  id: string;
  owner_id: string;
  company_id: string;
  primary_contact_id: string | null;
  title: string;
  stage: DealStage;
  status: DealStatus;
  value_amount: number | string | null;
  value_currency: string;
  value_period: DealValuePeriod;
  probability: number | null;
  expected_close_date: string | null;
  closed_at: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type DealWithCompany = Deal & {
  company: {
    id: string;
    name: string;
  } | null;
  owner: {
    id: string;
    email: string | null;
    full_name: string | null;
    display_name: string | null;
  } | null;
  last_activity: {
    id: string;
    type: string;
    title: string;
    occurred_at: string;
  } | null;
};

const dealSelect =
  "id, owner_id, company_id, primary_contact_id, title, stage, status, value_amount, value_currency, value_period, probability, expected_close_date, closed_at, description, created_at, updated_at";

export async function listDeals() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("deals")
    .select(
      `${dealSelect}, company:companies(id, name), owner:profiles!deals_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const deals = (data ?? []) as unknown as DealWithCompany[];
  const companyIds = Array.from(new Set(deals.map((deal) => deal.company_id)));

  if (companyIds.length === 0) {
    return deals;
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("id, company_id, type, title, occurred_at")
    .in("company_id", companyIds)
    .order("occurred_at", { ascending: false });

  if (activitiesError) {
    throw new Error(activitiesError.message);
  }

  const latestActivityByCompany = new Map<
    string,
    NonNullable<DealWithCompany["last_activity"]>
  >();

  for (const activity of activities ?? []) {
    if (
      activity.company_id &&
      !latestActivityByCompany.has(activity.company_id)
    ) {
      latestActivityByCompany.set(activity.company_id, {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        occurred_at: activity.occurred_at,
      });
    }
  }

  return deals.map((deal) => ({
    ...deal,
    last_activity: latestActivityByCompany.get(deal.company_id) ?? null,
  }));
}

export async function listDealsForCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("deals")
    .select(dealSelect)
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Deal[];
}

export async function getDeal(dealId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("deals")
    .select(
      `${dealSelect}, company:companies(id, name), owner:profiles!deals_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .eq("id", dealId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id, type, title, occurred_at")
    .eq("company_id", data.company_id)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activityError) {
    throw new Error(activityError.message);
  }

  return {
    ...(data as unknown as DealWithCompany),
    last_activity: activity ?? null,
  };
}
