import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { DealActivityActions } from "@/components/crm/deal-activity-actions";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
import { DealEditModalButton } from "@/components/crm/deal-edit-modal-button";
import { RichTextDisplay } from "@/components/crm/rich-text-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActivitiesForCompany } from "@/lib/db/activities";
import { listCompanies } from "@/lib/db/companies";
import { listContactsForCompany } from "@/lib/db/contacts";
import { getDeal } from "@/lib/db/deals";
import { getCurrentProfile, listTeamProfiles } from "@/lib/db/profiles";
import { listActiveValueProps } from "@/lib/db/value-props";
import { dealStatusLabels } from "@/lib/deals/constants";
import { formatDealValuePair } from "@/lib/deals/value";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";

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
  const deal = await getDeal(dealId);
  const [
    activities,
    companies,
    contacts,
    valueProps,
    currentProfile,
    teamProfiles,
  ] = await Promise.all([
    listActivitiesForCompany(deal.company_id),
    listCompanies(),
    listContactsForCompany(deal.company_id),
    listActiveValueProps(),
    getCurrentProfile(),
    listTeamProfiles(),
  ]);
  const formattedValue = formatDealValuePair(
    deal.value_amount,
    deal.value_currency,
    deal.value_period,
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/deals"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zurück
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-950">
              {deal.title}
            </h1>
            <DealStageBadge stage={deal.stage} />
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {deal.company ? (
              <Link
                href={`/companies/${deal.company.id}`}
                className="hover:underline"
              >
                {deal.company.name}
              </Link>
            ) : (
              "Deal ohne Unternehmenskontext"
            )}
          </p>
        </div>
        <DealEditModalButton
          companies={companies}
          compact={false}
          deal={deal}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal-Details</CardTitle>
          <CardDescription>Wert, Wahrscheinlichkeit und Timing</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="MRR / ARR"
              value={
                formattedValue ? (
                  <span>
                    MRR {formattedValue.mrr}
                    <br />
                    <span className="text-neutral-500">
                      ARR {formattedValue.arr}
                    </span>
                  </span>
                ) : null
              }
            />
            <DetailItem
              label="Wahrscheinlichkeit"
              value={deal.probability === null ? null : `${deal.probability}%`}
            />
            <DetailItem
              label="Erwarteter Abschluss"
              value={
                deal.expected_close_date
                  ? formatDate(deal.expected_close_date)
                  : null
              }
            />
            <DetailItem label="Status" value={dealStatusLabels[deal.status]} />
          </dl>
          {deal.description ? (
            <RichTextDisplay
              className="mt-5 text-sm text-neutral-700"
              value={deal.description}
            />
          ) : null}
        </CardContent>
      </Card>

      <DealActivityActions
        companyId={deal.company_id}
        currentProfileId={currentProfile.id}
        dealId={deal.id}
        contacts={contacts}
        defaultContactId={deal.primary_contact_id}
        teamProfiles={teamProfiles}
        valueProps={valueProps}
        error={errorMessage(error)}
      />
      <ActivityTimeline
        activities={activities}
        returnTo={`/deals/${deal.id}`}
        valueProps={valueProps}
        title="Unternehmensaktivitäten"
        description={`Alle Aktivitäten von ${deal.company?.name ?? "diesem Unternehmen"}`}
      />
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-950">{value ?? "-"}</dd>
    </div>
  );
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
    return "Bitte gib einen Titel für die Aktivität ein.";
  }

  if (error === "missing_context") {
    return "Der Aktivität fehlt ein Unternehmen oder Deal.";
  }

  if (error === "missing_task_title") {
    return "Bitte gib einen Titel für die Follow-up-Task ein.";
  }

  if (error === "missing_task_due_date") {
    return "Bitte gib ein Fälligkeitsdatum für die Follow-up-Task ein.";
  }

  if (error === "missing_outreach_fields") {
    return "Bitte fülle die erforderlichen Outreach-Felder aus.";
  }

  if (error === "task_title_too_long") {
    return `Der Task-Titel darf maximal ${TASK_TITLE_MAX_LENGTH} Zeichen lang sein.`;
  }

  if (error === "task_description_too_long") {
    return `Die Task-Beschreibung darf maximal ${TASK_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`;
  }

  return decodeURIComponent(error);
}
