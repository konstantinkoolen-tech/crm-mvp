import { CalendarDays, List } from "lucide-react";
import Link from "next/link";
import { EventCreateModalButton } from "@/components/crm/event-create-modal-button";
import { EventDeleteForm } from "@/components/crm/event-delete-form";
import { EventEditModalButton } from "@/components/crm/event-edit-modal-button";
import { buttonVariants } from "@/components/ui/button-variants";
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
import type { EventWithDates } from "@/lib/db/events";
import type { TeamProfile } from "@/lib/db/profiles";
import {
  eventInternalParticipants,
  formatEventDateRange,
} from "@/lib/events/format";

type EventListProps = {
  currentProfileId: string;
  events: EventWithDates[];
  profiles: TeamProfile[];
  view: "list" | "calendar";
};

export function EventList({
  currentProfileId,
  events,
  profiles,
  view,
}: EventListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            {events.length} {events.length === 1 ? "Eintrag" : "Einträge"}
          </CardDescription>
        </div>
        <EventCreateModalButton
          currentProfileId={currentProfileId}
          label="Event"
          profiles={profiles}
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <ViewLink active={view === "list"} href="/events" icon={List}>
            Liste
          </ViewLink>
          <ViewLink
            active={view === "calendar"}
            href="/events?view=calendar"
            icon={CalendarDays}
          >
            Kalender
          </ViewLink>
        </div>

        {view === "calendar" ? (
          <CalendarPlaceholder />
        ) : (
          <EventTable events={events} profiles={profiles} />
        )}
      </CardContent>
    </Card>
  );
}

function ViewLink({
  active,
  children,
  href,
  icon: Icon,
}: {
  active: boolean;
  children: React.ReactNode;
  href: string;
  icon: typeof List;
}) {
  return (
    <Link
      href={href}
      className={buttonVariants({
        variant: active ? "default" : "outline",
        className: "h-9",
      })}
      aria-current={active ? "page" : undefined}
    >
      <Icon aria-hidden="true" />
      {children}
    </Link>
  );
}

function EventTable({
  events,
  profiles,
}: {
  events: EventWithDates[];
  profiles: TeamProfile[];
}) {
  if (events.length === 0) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
        <p className="text-sm font-medium text-neutral-950">
          Noch keine Events
        </p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          Erstelle das erste Event, um Unternehmen und Kontakte damit zu
          verknüpfen.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead>Fokus</TableHead>
          <TableHead>Interne Teilnehmer</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const participants = eventInternalParticipants(event);

          return (
            <TableRow key={event.id}>
              <TableCell>
                <Link
                  href={`/events/${event.id}`}
                  className="font-medium text-neutral-950 hover:underline"
                >
                  {event.name}
                </Link>
                {event.location ? (
                  <div className="mt-1 text-xs text-neutral-500">
                    {event.location}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>{formatEventDateRange(event.dates)}</TableCell>
              <TableCell>{event.focus ?? "-"}</TableCell>
              <TableCell>
                {participants.length > 0 ? participants.join(", ") : "-"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <EventEditModalButton event={event} profiles={profiles} />
                  <EventDeleteForm eventId={event.id} compact />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function CalendarPlaceholder() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-white text-neutral-500 ring-1 ring-neutral-200">
          <CalendarDays className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-neutral-950">
          Kalender-Ansicht kommt als nächstes
        </p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          Der Platzhalter ist vorbereitet. Die Befüllung mit Event-Terminen folgt
          in einem späteren Schritt.
        </p>
      </div>
    </div>
  );
}
