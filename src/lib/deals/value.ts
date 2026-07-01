import type { DealValuePeriod } from "@/types/database";

export type DealValueAmount = number | string | null | undefined;

export type DealValuePair = {
  arr: number;
  mrr: number;
};

export type DealValueCarrier = {
  value_amount: DealValueAmount;
  value_currency: string;
  value_period: DealValuePeriod;
};

export function normalizeDealValuePair(
  value: DealValueAmount,
  period: DealValuePeriod = "mrr",
): DealValuePair | null {
  const numericValue = numericDealValue(value);

  if (numericValue === null) {
    return null;
  }

  if (period === "arr") {
    return {
      arr: numericValue,
      mrr: numericValue / 12,
    };
  }

  return {
    arr: numericValue * 12,
    mrr: numericValue,
  };
}

export function dealValueToArr(
  value: DealValueAmount,
  period: DealValuePeriod,
) {
  return normalizeDealValuePair(value, period)?.arr ?? 0;
}

export function formatCurrencyAmount(value: number, currency: string) {
  const cleanedCurrency = currency.trim().toUpperCase() || "EUR";

  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: cleanedCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 0,
    }).format(value)} ${cleanedCurrency}`;
  }
}

export function formatDealValuePair(
  value: DealValueAmount,
  currency: string,
  period: DealValuePeriod,
) {
  const pair = normalizeDealValuePair(value, period);

  if (!pair) {
    return null;
  }

  return {
    arr: formatCurrencyAmount(pair.arr, currency),
    mrr: formatCurrencyAmount(pair.mrr, currency),
  };
}

export function summarizeDealValuePairsByCurrency(deals: DealValueCarrier[]) {
  const totals = new Map<string, DealValuePair>();

  for (const deal of deals) {
    const pair = normalizeDealValuePair(deal.value_amount, deal.value_period);

    if (!pair) {
      continue;
    }

    const currency = deal.value_currency.trim().toUpperCase() || "EUR";
    const current = totals.get(currency) ?? { arr: 0, mrr: 0 };
    totals.set(currency, {
      arr: current.arr + pair.arr,
      mrr: current.mrr + pair.mrr,
    });
  }

  return Array.from(totals, ([currency, pair]) => ({
    currency,
    ...pair,
  })).sort((a, b) => a.currency.localeCompare(b.currency));
}

function numericDealValue(value: DealValueAmount) {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}
