import type { DealStage, DealStatus, DealValuePeriod } from "@/types/database";

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

export const dealStatuses = [
  "open",
  "won",
  "lost",
  "churn",
] as const satisfies readonly DealStatus[];

export const dealStatusLabels: Record<DealStatus, string> = {
  open: "In Verhandlung",
  won: "Gewonnen",
  lost: "Verloren",
  churn: "Churn",
};

export const dealValuePeriods = [
  "mrr",
  "arr",
] as const satisfies readonly DealValuePeriod[];

export const dealValuePeriodLabels: Record<DealValuePeriod, string> = {
  mrr: "MRR",
  arr: "ARR",
};

export function dealValuePeriodFromForm(
  value: FormDataEntryValue | null,
): DealValuePeriod {
  const period = String(value ?? "mrr")
    .trim()
    .toLowerCase();

  return dealValuePeriods.includes(period as DealValuePeriod)
    ? (period as DealValuePeriod)
    : "mrr";
}

export function dealStatusForStage(stage: DealStage): DealStatus {
  if (stage === "won") {
    return "won";
  }

  if (stage === "lost") {
    return "lost";
  }

  return "open";
}
