import type {
  EventAssociationWithContext,
  EventDateWithOwner,
  EventWithDates,
} from "@/lib/db/events";
import { ownerDisplayName } from "@/lib/list-display";

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatEventDateRange(dates: EventDateWithOwner[]) {
  if (dates.length === 0) {
    return "-";
  }

  if (dates.length === 1) {
    return formatEventDate(dates[0].event_date);
  }

  return `${formatEventDate(dates[0].event_date)} +${dates.length - 1}`;
}

export function eventInternalParticipants(event: EventWithDates) {
  const participants = new Map<string, string>();

  for (const date of event.dates) {
    if (date.internal_owner) {
      participants.set(date.internal_owner.id, ownerDisplayName(date.internal_owner));
    }
  }

  return [...participants.values()].sort((a, b) =>
    a.localeCompare(b, "de", { sensitivity: "base" }),
  );
}

export function contactName(
  contact: Pick<
    NonNullable<EventAssociationWithContext["contact"]>,
    "first_name" | "last_name"
  >,
) {
  return `${contact.first_name} ${contact.last_name}`.trim();
}
