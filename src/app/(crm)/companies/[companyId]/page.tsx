import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CompanyActivityNotesPanel } from "@/components/crm/company-activity-notes-panel";
import { CompanyContacts } from "@/components/crm/company-contacts";
import { CompanyDeals } from "@/components/crm/company-deals";
import { CompanyDeleteForm } from "@/components/crm/company-delete-form";
import { CompanyEditModalButton } from "@/components/crm/company-edit-modal-button";
import { CompanyEvents } from "@/components/crm/company-events";
import { CompanyStatusBadge } from "@/components/crm/company-status-badge";
import { InlineCompanyNotes } from "@/components/crm/inline-company-notes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { employeeCountFromValue } from "@/lib/companies/employee-count";
import { getCompany, listCompanies } from "@/lib/db/companies";
import { listActivitiesForCompany } from "@/lib/db/activities";
import { listContactsForCompany } from "@/lib/db/contacts";
import { listDealsForCompany } from "@/lib/db/deals";
import {
  listEventAssociationsForCompany,
  listEvents,
} from "@/lib/db/events";
import { getCurrentProfile, listTeamProfiles } from "@/lib/db/profiles";
import { ownerDisplayName } from "@/lib/list-display";
import { listTasksForCompany } from "@/lib/db/tasks";
import { listActiveValueProps } from "@/lib/db/value-props";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";

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
  const [
    company,
    companies,
    contacts,
    deals,
    activities,
    tasks,
    events,
    eventAssociations,
    valueProps,
    currentProfile,
    teamProfiles,
  ] = await Promise.all([
    getCompany(companyId),
    listCompanies(),
    listContactsForCompany(companyId),
    listDealsForCompany(companyId),
    listActivitiesForCompany(companyId),
    listTasksForCompany(companyId),
    listEvents(),
    listEventAssociationsForCompany(companyId),
    listActiveValueProps(),
    getCurrentProfile(),
    listTeamProfiles(),
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
            Zurück
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
          <CompanyEditModalButton company={company} profiles={teamProfiles} />
          <CompanyDeleteForm companyId={company.id} />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Basisdaten</CardTitle>
            <CardDescription>Account-Informationen</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Website" value={company.website} />
              <PhoneDetailItem value={company.phone} />
              <DetailItem
                label="Company-E-Mail"
                value={company.company_email}
              />
              <DetailItem label="Branche" value={company.industry} />
              <DetailItem
                label="Mitarbeiter"
                value={employeeCountFromValue(company.employee_count)}
              />
              <DetailItem
                label="Zuständiger Mitarbeiter"
                value={ownerDisplayName(company.owner)}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
            <CardDescription>Interner Kontext</CardDescription>
          </CardHeader>
          <CardContent>
            <InlineCompanyNotes
              companyId={company.id}
              initialNotes={company.notes}
            />
          </CardContent>
        </Card>
      </div>

      <CompanyContacts
        companyId={company.id}
        companyName={company.name}
        contacts={contacts}
        activities={activities}
        tasks={tasks}
        valueProps={valueProps}
        currentProfileId={currentProfile.id}
        teamProfiles={teamProfiles}
        eventAssociations={eventAssociations}
        events={events}
      />
      <CompanyEvents
        associations={eventAssociations}
        companyId={company.id}
        contacts={contacts}
        events={events}
      />
      <CompanyDeals
        companyId={company.id}
        companies={companies}
        deals={deals}
      />
      <CompanyActivityNotesPanel
        companyId={company.id}
        companyName={company.name}
        contacts={contacts}
        tasks={tasks}
        activities={activities}
        valueProps={valueProps}
        currentProfileId={currentProfile.id}
        teamProfiles={teamProfiles}
        error={errorMessage(error)}
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

function PhoneDetailItem({ value }: { value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">Telefon</dt>
      <dd className="mt-1 text-sm text-neutral-950">
        {value ? (
          <a
            className="hover:underline"
            href={`tel:${value.replace(/[^\d+]/g, "")}`}
          >
            {value}
          </a>
        ) : (
          "-"
        )}
      </dd>
    </div>
  );
}

function errorMessage(error?: string) {
  if (!error) {
    return undefined;
  }

  if (error === "missing_title") {
    return "Bitte gib einen Titel ein.";
  }

  if (error === "missing_context") {
    return "Der Aktivität fehlt ein Unternehmen oder Deal.";
  }

  if (error === "missing_task_title") {
    return "Bitte gib einen Titel für die Follow-up Task ein.";
  }

  if (error === "missing_task_due_date") {
    return "Bitte gib ein Fälligkeitsdatum für die Follow-up Task ein.";
  }

  if (error === "missing_due_date") {
    return "Bitte gib ein Fälligkeitsdatum für die Task ein.";
  }

  if (error === "missing_outreach_fields") {
    return "Bitte fülle die erforderlichen Outreach-Felder aus.";
  }

  if (error === "title_too_long" || error === "task_title_too_long") {
    return `Der Task-Titel darf maximal ${TASK_TITLE_MAX_LENGTH} Zeichen lang sein.`;
  }

  if (error === "description_too_long" || error === "task_description_too_long") {
    return `Die Task-Beschreibung darf maximal ${TASK_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`;
  }

  return decodeURIComponent(error);
}
