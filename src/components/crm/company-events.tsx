import Link from "next/link";
import { CompanyEventAssociationButton } from "@/components/crm/event-association-buttons";
import { EventAssociationDeleteForm } from "@/components/crm/event-association-delete-form";
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
import type { Contact } from "@/lib/db/contacts";
import type {
  EventAssociationWithContext,
  EventWithDates,
} from "@/lib/db/events";
import { contactName, formatEventDate } from "@/lib/events/format";

type CompanyEventsProps = {
  associations: EventAssociationWithContext[];
  companyId: string;
  contacts: Contact[];
  events: EventWithDates[];
};

export function CompanyEvents({
  associations,
  companyId,
  contacts,
  events,
}: CompanyEventsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Veranstaltungen, bei denen dieses Unternehmen relevant war.
          </CardDescription>
        </div>
        <CompanyEventAssociationButton
          companyId={companyId}
          contacts={contacts}
          events={events}
          returnTo={`/companies/${companyId}`}
        />
      </CardHeader>
      <CardContent>
        {associations.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Events
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Ordne ein Event zu, sobald ein Unternehmen oder Kontakt dort
              kennengelernt wurde.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Notiz</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associations.map((association) => (
                <TableRow key={association.id}>
                  <TableCell>
                    {association.event ? (
                      <Link
                        href={`/events/${association.event.id}`}
                        className="font-medium text-neutral-950 hover:underline"
                      >
                        {association.event.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                    {association.event?.focus ? (
                      <div className="mt-1 text-xs text-neutral-500">
                        {association.event.focus}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {association.contact ? contactName(association.contact) : "-"}
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
                        companyId={companyId}
                        eventId={association.event_id}
                        returnTo={`/companies/${companyId}`}
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
  );
}
