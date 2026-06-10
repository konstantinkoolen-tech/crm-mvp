import { notFound } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type { DealStage, DealStatus } from "@/types/database";

export const dealStages = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const satisfies readonly DealStage[];

export const dealStageLabels: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualifiziert",
  proposal: "Angebot",
  negotiation: "Verhandlung",
  won: "Gewonnen",
  lost: "Verloren",
};

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
};

const dealSelect =
  "id, owner_id, company_id, primary_contact_id, title, stage, status, value_amount, value_currency, probability, expected_close_date, closed_at, description, created_at, updated_at";

export async function listDeals() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("deals")
    .select(`${dealSelect}, company:companies(id, name)`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DealWithCompany[];
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
    .select(`${dealSelect}, company:companies(id, name)`)
    .eq("id", dealId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as DealWithCompany;
}
