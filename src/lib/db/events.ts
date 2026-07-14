import { notFound } from "next/navigation";
import { getCompanyClient, type ListOwner } from "@/lib/db/companies";

export type EventDate = {
  id: string;
  event_id: string;
  event_date: string;
  internal_owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EventDateWithOwner = EventDate & {
  internal_owner: ListOwner | null;
};

export type Event = {
  id: string;
  owner_id: string;
  name: string;
  website: string | null;
  location: string | null;
  participant_count: number | null;
  focus: string | null;
  internal_notes: string | null;
  price: string | null;
  access: string | null;
  created_at: string;
  updated_at: string;
};

export type EventWithDates = Event & {
  dates: EventDateWithOwner[];
};

export type EventAssociationWithContext = {
  id: string;
  event_id: string;
  event_date_id: string | null;
  company_id: string;
  contact_id: string | null;
  last_edited_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event: {
    id: string;
    name: string;
    focus: string | null;
  } | null;
  event_date: (EventDate & { internal_owner: ListOwner | null }) | null;
  company: {
    id: string;
    name: string;
  } | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    job_title: string | null;
  } | null;
  last_editor: ListOwner | null;
};

export type EventWithDetails = EventWithDates & {
  associations: EventAssociationWithContext[];
};

const ownerSelect = "id, email, full_name, display_name";
const eventBaseSelect =
  "id, owner_id, name, website, location, participant_count, focus, internal_notes, price, access, created_at, updated_at";
const eventDateSelect = `id, event_id, event_date, internal_owner_id, created_at, updated_at, internal_owner:profiles!event_dates_internal_owner_id_fkey(${ownerSelect})`;
const eventAssociationSelect = `id, event_id, event_date_id, company_id, contact_id, last_edited_by, notes, created_at, updated_at, event:events(id, name, focus), event_date:event_dates(id, event_id, event_date, internal_owner_id, created_at, updated_at, internal_owner:profiles!event_dates_internal_owner_id_fkey(${ownerSelect})), company:companies(id, name), contact:contacts(id, first_name, last_name, email, job_title), last_editor:profiles!event_associations_last_edited_by_fkey(${ownerSelect})`;

export async function listEvents() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("events")
    .select(`${eventBaseSelect}, dates:event_dates(${eventDateSelect})`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortEventDates((data ?? []) as unknown as EventWithDates[]);
}

export async function getEvent(eventId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `${eventBaseSelect}, dates:event_dates(${eventDateSelect}), associations:event_associations(${eventAssociationSelect})`,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const event = data as unknown as EventWithDetails;
  event.dates = sortDates(event.dates);
  event.associations = sortAssociations(event.associations);

  return event;
}

export async function listEventAssociationsForCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("event_associations")
    .select(eventAssociationSelect)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortAssociations(
    (data ?? []) as unknown as EventAssociationWithContext[],
  );
}

export async function listEventAssociationsForContact(contactId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("event_associations")
    .select(eventAssociationSelect)
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortAssociations(
    (data ?? []) as unknown as EventAssociationWithContext[],
  );
}

function sortEventDates(events: EventWithDates[]) {
  return events.map((event) => ({
    ...event,
    dates: sortDates(event.dates),
  }));
}

function sortDates(dates: EventDateWithOwner[]) {
  return [...(dates ?? [])].sort(
    (a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
  );
}

function sortAssociations(associations: EventAssociationWithContext[]) {
  return [...(associations ?? [])].sort((a, b) => {
    const aTime = a.event_date?.event_date ?? a.created_at;
    const bTime = b.event_date?.event_date ?? b.created_at;

    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });
}
