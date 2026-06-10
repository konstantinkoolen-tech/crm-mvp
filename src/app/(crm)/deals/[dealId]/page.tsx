import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { ActivityForm } from "@/components/crm/activity-form";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActivitiesForDeal } from "@/lib/db/activities";
import { getDeal } from "@/lib/db/deals";

type DealDetailPageProps = {
  params: Promise<{
    dealId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function DealDetailPage({
  params,
  searchParams,
}: DealDetailPageProps) {
  const [{ dealId }, { error }] = await Promise.all([params, searchParams]);
  const [deal, activities] = await Promise.all([
    getDeal(dealId),
    listActivitiesForDeal(dealId),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/deals"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zurueck
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-950">{deal.title}</h1>
            <DealStageBadge stage={deal.stage} />
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {deal.company ? (
              <Link href={`/companies/${deal.company.id}`} className="hover:underline">
                {deal.company.name}
              </Link>
            ) : (
              "Deal ohne Unternehmenskontext"
            )}
          </p>
        </div>
        <Link
          href={`/deals/${deal.id}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          <Pencil aria-hidden="true" />
          Bearbeiten
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal-Details</CardTitle>
          <CardDescription>Wert, Wahrscheinlichkeit und Timing</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Wert"
              value={formatDealValue(deal.value_amount, deal.value_currency)}
            />
            <DetailItem
              label="Wahrscheinlichkeit"
              value={deal.probability === null ? null : `${deal.probability}%`}
            />
            <DetailItem
              label="Erwarteter Abschluss"
              value={deal.expected_close_date ? formatDate(deal.expected_close_date) : null}
            />
            <DetailItem label="Status" value={deal.status} />
          </dl>
          {deal.description ? (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
              {deal.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ActivityForm
        companyId={deal.company_id}
        dealId={deal.id}
        returnTo={`/deals/${deal.id}`}
        error={errorMessage(error)}
      />
      <ActivityTimeline
        activities={activities}
        returnTo={`/deals/${deal.id}`}
        title="Deal-Aktivitaeten"
        description="Chronologisch nach Zeitpunkt sortiert"
      />
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-950">{value ?? "-"}</dd>
    </div>
  );
}

function formatDealValue(value: string | number | null, currency: string) {
  if (value === null) {
    return null;
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

function errorMessage(error?: string) {
  if (!error) {
    return undefined;
  }

  if (error === "missing_title") {
    return "Bitte gib einen Titel fuer die Aktivitaet ein.";
  }

  if (error === "missing_context") {
    return "Der Aktivitaet fehlt ein Unternehmen oder Deal.";
  }

  return decodeURIComponent(error);
}
