import type { CompanyStatus } from "@/types/database";

export const companyStatuses = [
  "new",
  "contacted",
  "in_exchange",
  "active_customer",
  "lost_customer",
  "churn",
] as const satisfies readonly CompanyStatus[];

export const companyStatusLabels: Record<CompanyStatus, string> = {
  new: "Neu",
  contacted: "Angesprochen",
  in_exchange: "Im Austausch",
  active_customer: "Aktiver Kunde",
  lost_customer: "Verloren",
  churn: "Churn",
};
