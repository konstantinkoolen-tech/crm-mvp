"use client";

import { useState } from "react";
import { dealValuePeriodLabels, dealValuePeriods } from "@/lib/deals/constants";
import { cn } from "@/lib/utils";
import type { DealValuePeriod } from "@/types/database";

type DealValuePeriodToggleProps = {
  defaultValue?: DealValuePeriod;
  idPrefix: string;
  name?: string;
};

export function DealValuePeriodToggle({
  defaultValue = "mrr",
  idPrefix,
  name = "value_period",
}: DealValuePeriodToggleProps) {
  const [value, setValue] = useState<DealValuePeriod>(defaultValue);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">Wert-Typ</legend>
      <input type="hidden" name={name} value={value} />
      <div className="grid h-10 grid-cols-2 rounded-md border border-neutral-200 bg-neutral-50 p-1">
        {dealValuePeriods.map((period) => (
          <button
            key={period}
            id={`${idPrefix}-${period}`}
            type="button"
            aria-pressed={value === period}
            className={cn(
              "rounded px-3 text-sm font-medium transition",
              value === period
                ? "bg-neutral-950 text-white shadow-sm"
                : "text-neutral-600 hover:bg-white hover:text-neutral-950",
            )}
            onClick={() => setValue(period)}
          >
            {dealValuePeriodLabels[period]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
