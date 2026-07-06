import { EventList } from "@/components/crm/event-list";
import { getCurrentProfile, listTeamProfiles } from "@/lib/db/profiles";
import { listEvents } from "@/lib/db/events";

type EventsPageProps = {
  searchParams: Promise<{
    error?: string;
    view?: string;
  }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const [{ error, view }, events, currentProfile, profiles] = await Promise.all([
    searchParams,
    listEvents(),
    getCurrentProfile(),
    listTeamProfiles(),
  ]);
  const selectedView = view === "calendar" ? "calendar" : "list";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Events</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Veranstaltungen, Kontakte und Unternehmen im CRM-Kontext.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage(error)}
        </div>
      ) : null}

      <EventList
        currentProfileId={currentProfile.id}
        events={events}
        profiles={profiles}
        view={selectedView}
      />
    </section>
  );
}

function errorMessage(error: string) {
  if (error === "missing_event_name") {
    return "Bitte gib einen Event-Namen ein.";
  }

  if (error === "missing_event_date") {
    return "Bitte hinterlege mindestens ein Datum.";
  }

  return decodeURIComponent(error);
}
