import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  EventAssociationCreateModalButton,
  EventCompanyCreateModalButton,
  EventContactCreateModalButton,
} from "@/components/crm/event-association-buttons";
import { EventAssociationDeleteForm } from "@/components/crm/event-association-delete-form";
import { EventDeleteForm } from "@/components/crm/event-delete-form";
import { EventEditModalButton } from "@/components/crm/event-edit-modal-button";
import { RichTextDisplay } from "@/components/crm/rich-text-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCompanies } from "@/lib/db/companies";
import { listContacts } from "@/lib/db/contacts";
import { getEvent } from "@/lib/db/events";
import { listTeamProfiles } from "@/lib/db/profiles";
import { contactName, formatEventDate } from "@/lib/events/format";
import { ownerDisplayName } from "@/lib/list-display";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const [{ eventId }, { error }] = await Promise.all([params, searchParams]);
  const [event, companies, contacts, profiles] = await Promise.all([
    getEvent(eventId),
    listCompanies(),
    listContacts(),
    listTeamProfiles(),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/events"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zurück
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-950">
              {event.name}
            </h1>
            {event.focus ? (
              <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">
                {event.focus}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Event-Übersicht, Termine und CRM-Zuordnungen.
          </p>
        </div>

        <div className="flex gap-2">
          <EventEditModalButton event={event} profiles={profiles} />
          <EventDeleteForm eventId={event.id} />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage(error)}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Basisdaten</CardTitle>
            <CardDescription>Event-Informationen</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <WebsiteDetailItem value={event.website} />
              <DetailItem label="Ort" value={event.location} />
              <DetailItem
                label="Teilnehmerzahl"
                value={
                  event.participant_count === null
                    ? null
                    : String(event.participant_count)
                }
              />
              <DetailItem label="Fokus" value={event.focus} />
              <DetailItem label="Preis" value={event.price} />
              <DetailItem label="Zugang" value={event.access} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interne Notiz</CardTitle>
            <CardDescription>Kontext und Vorbereitung</CardDescription>
          </CardHeader>
          <CardContent>
            {event.internal_notes ? (
              <RichTextDisplay
                className="text-sm leading-6 text-neutral-700"
                value={event.internal_notes}
              />
            ) : (
              <p className="text-sm text-neutral-500">Noch keine Notiz.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Termine</CardTitle>
          <CardDescription>Datum und interne Zuordnung je Termin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {event.dates.map((date) => (
              <div
                className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3"
                key={date.id}
              >
                <p className="text-sm font-semibold text-neutral-950">
                  {formatEventDate(date.event_date)}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {date.internal_owner
                    ? ownerDisplayName(date.internal_owner)
                    : "Nicht zugeordnet"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Unternehmen und Kontakte</CardTitle>
            <CardDescription>
              CRM-Objekte, die diesem Event zugeordnet sind.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <EventCompanyCreateModalButton event={event} profiles={profiles} />
            <EventContactCreateModalButton companies={companies} event={event} />
            <EventAssociationCreateModalButton
              companies={companies}
              contacts={contacts}
              event={event}
            />
          </div>
        </CardHeader>
        <CardContent>
          {event.associations.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
              <p className="text-sm font-medium text-neutral-950">
                Noch keine Zuordnungen
              </p>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Füge Unternehmen oder Kontakte hinzu, die bei diesem Event
                kennengelernt wurden.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Notiz</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.associations.map((association) => (
                  <TableRow key={association.id}>
                    <TableCell>
                      {association.company ? (
                        <Link
                          href={`/companies/${association.company.id}`}
                          className="font-medium text-neutral-950 hover:underline"
                        >
                          {association.company.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {association.contact ? (
                        <span>
                          {contactName(association.contact)}
                          {association.contact.job_title ? (
                            <span className="mt-1 block text-xs text-neutral-500">
                              {association.contact.job_title}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {association.event_date
                        ? formatEventDate(association.event_date.event_date)
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {association.notes ? (
                        <RichTextDisplay
                          className="text-sm text-neutral-600"
                          value={association.notes}
                        />
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <EventAssociationDeleteForm
                          associationId={association.id}
                          companyId={association.company_id}
                          eventId={event.id}
                          returnTo={`/events/${event.id}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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

function WebsiteDetailItem({ value }: { value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">Webseite</dt>
      <dd className="mt-1 text-sm text-neutral-950">
        {value ? (
          <Link
            className="inline-flex items-center gap-1 hover:underline"
            href={value}
            target="_blank"
            rel="noreferrer"
          >
            {value}
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        ) : (
          "-"
        )}
      </dd>
    </div>
  );
}

function errorMessage(error: string) {
  if (error === "missing_event_name") {
    return "Bitte gib einen Event-Namen ein.";
  }

  if (error === "missing_event_date") {
    return "Bitte hinterlege mindestens ein Datum.";
  }

  if (error === "missing_company_name") {
    return "Bitte gib einen Unternehmensnamen ein.";
  }

  if (error === "missing_contact_name") {
    return "Bitte gib Vor- und Nachnamen des Kontakts ein.";
  }

  if (error === "missing_event_association") {
    return "Bitte wähle ein Event und ein Unternehmen aus.";
  }

  return decodeURIComponent(error);
}
