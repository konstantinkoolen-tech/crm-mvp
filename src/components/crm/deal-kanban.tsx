import { CalendarDays, ChevronRight, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { updateDealStage } from "@/app/(crm)/deals/actions";
import { DealDeleteForm } from "@/components/crm/deal-delete-form";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dealStageLabels,
  dealStages,
  type DealWithCompany,
} from "@/lib/db/deals";
import type { DealStage } from "@/types/database";

type DealKanbanProps = {
  deals: DealWithCompany[];
};

export function DealKanban({ deals }: DealKanbanProps) {
  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-neutral-950">
            Noch keine Deals
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Erstelle den ersten Deal und ordne ihn einer Pipeline-Stufe zu.
          </p>
          <Link href="/deals/new" className={buttonVariants({ className: "mt-5" })}>
            <Plus aria-hidden="true" />
            Deal erstellen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {dealStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage);

        return (
          <section key={stage} className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  {dealStageLabels[stage]}
                </h2>
                <p className="text-xs text-neutral-500">
                  {stageDeals.length} Deals
                </p>
              </div>
              <DealStageBadge stage={stage} />
            </div>

            <div className="space-y-3">
              {stageDeals.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
                  Keine Deals
                </div>
              ) : (
                stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DealCard({ deal }: { deal: DealWithCompany }) {
  const nextStage = nextStageFor(deal.stage);

  return (
    <Card className="rounded-lg">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm leading-5">
          <Link href={`/deals/${deal.id}`} className="hover:underline">
            {deal.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="space-y-1 text-sm">
          {deal.company ? (
            <Link
              href={`/companies/${deal.company.id}`}
              className="font-medium text-neutral-700 hover:underline"
            >
              {deal.company.name}
            </Link>
          ) : (
            <span className="text-neutral-500">Kein Unternehmen</span>
          )}
          <div className="text-neutral-950">
            {formatDealValue(deal.value_amount, deal.value_currency)}
          </div>
          {deal.expected_close_date ? (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDate(deal.expected_close_date)}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/deals/${deal.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil aria-hidden="true" />
            Bearbeiten
          </Link>
          <DealDeleteForm dealId={deal.id} companyId={deal.company_id} />
        </div>

        {nextStage ? (
          <form action={updateDealStage}>
            <input type="hidden" name="deal_id" value={deal.id} />
            <input type="hidden" name="company_id" value={deal.company_id} />
            <input type="hidden" name="stage" value={nextStage} />
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Nach {dealStageLabels[nextStage]}
              <ChevronRight aria-hidden="true" />
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function nextStageFor(stage: DealStage) {
  const nextStages: Partial<Record<DealStage, DealStage>> = {
    lead: "qualified",
    qualified: "proposal",
    proposal: "negotiation",
    negotiation: "won",
  };

  return nextStages[stage] ?? null;
}

function formatDealValue(value: DealWithCompany["value_amount"], currency: string) {
  if (value === null) {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
