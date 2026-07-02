"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RevenueScope = "pipeline" | "active";

type RevenueScopeSummary = {
  arr: string;
  dealCount: number;
  description: string;
  mrr: string;
};

type DealRevenueScopeCardProps = {
  active: RevenueScopeSummary;
  className?: string;
  pipeline: RevenueScopeSummary;
};

const scopeLabels: Record<RevenueScope, string> = {
  pipeline: "In der Pipeline",
  active: "Aktiv",
};

export function DealRevenueScopeCard({
  active,
  className,
  pipeline,
}: DealRevenueScopeCardProps) {
  const [scope, setScope] = useState<RevenueScope>("pipeline");
  const summary = scope === "pipeline" ? pipeline : active;

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">MRR / ARR</p>
            <p className="mt-1 text-xs text-neutral-500">
              {summary.dealCount} Deals · {summary.description}
            </p>
          </div>
          <div className="inline-flex rounded-md bg-neutral-100 p-1">
            {(Object.keys(scopeLabels) as RevenueScope[]).map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "h-7 rounded px-2 text-xs font-semibold transition",
                  scope === value
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-950",
                )}
                aria-pressed={scope === value}
                onClick={() => setScope(value)}
              >
                {value === "pipeline" ? "Pipeline" : "Aktiv"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <RevenueValue
            icon={
              <TrendingUp
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="MRR"
            value={summary.mrr}
          />
          <RevenueValue
            icon={
              <BarChart3
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="ARR"
            value={summary.arr}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueValue({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-neutral-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {icon}
      </div>
      <p className="mt-1 truncate text-xl font-semibold text-neutral-950">
        {value}
      </p>
    </div>
  );
}
