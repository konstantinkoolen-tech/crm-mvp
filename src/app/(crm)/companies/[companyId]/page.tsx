import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { ActivityForm } from "@/components/crm/activity-form";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { CompanyContacts } from "@/components/crm/company-contacts";
import { CompanyDeals } from "@/components/crm/company-deals";
import { CompanyDeleteForm } from "@/components/crm/company-delete-form";
import { CompanyStatusBadge } from "@/components/crm/company-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCompany } from "@/lib/db/companies";
import { listActivitiesForCompany } from "@/lib/db/activities";
import { listContactsForCompany } from "@/lib/db/contacts";
import { listDealsForCompany } from "@/lib/db/deals";

type CompanyDetailPageProps = {
  params: Promise<{
    companyId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function CompanyDetailPage({
  params,
  searchParams,
}: CompanyDetailPageProps) {
  const [{ companyId }, { error }] = await Promise.all([params, searchParams]);
  const [company, contacts, deals, activities] = await Promise.all([
    getCompany(companyId),
    listContactsForCompany(companyId),
    listDealsForCompany(companyId),
    listActivitiesForCompany(companyId),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/companies"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zurueck
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-950">
              {company.name}
            </h1>
            <CompanyStatusBadge status={company.status} />
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Unternehmensprofil und CRM-Kontext.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/companies/${company.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Pencil aria-hidden="true" />
            Bearbeiten
          </Link>
          <CompanyDeleteForm companyId={company.id} />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Basisdaten</CardTitle>
            <CardDescription>Account-Informationen</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Website" value={company.website} />
              <DetailItem label="Branche" value={company.industry} />
              <DetailItem
                label="Mitarbeiter"
                value={
                  company.employee_count === null
                    ? null
                    : String(company.employee_count)
                }
              />
              <DetailItem label="Status" value={company.status} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
            <CardDescription>Interner Kontext</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
              {company.notes ?? "Keine Notizen hinterlegt."}
            </p>
          </CardContent>
        </Card>
      </div>

      <CompanyContacts
        companyId={company.id}
        contacts={contacts}
        activities={activities}
      />
      <CompanyDeals companyId={company.id} deals={deals} />
      <ActivityForm
        companyId={company.id}
        contacts={contacts}
        returnTo={`/companies/${company.id}`}
        error={errorMessage(error)}
      />
      <ActivityTimeline
        activities={activities}
        returnTo={`/companies/${company.id}`}
        title="Aktivitaeten und Notizen"
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
