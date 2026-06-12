import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { listActivities } from "@/lib/db/activities";

export default function ActivitiesPage() {
  const activitiesPromise = listActivities();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Aktivitäten</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Notizen, Calls, E-Mails und Meetings chronologisch über alle Kontexte.
        </p>
      </div>
      <ActivitiesList activitiesPromise={activitiesPromise} />
    </section>
  );
}

async function ActivitiesList({
  activitiesPromise,
}: {
  activitiesPromise: ReturnType<typeof listActivities>;
}) {
  const activities = await activitiesPromise;

  return (
    <ActivityTimeline
      activities={activities}
      returnTo="/activities"
      title="Alle Aktivitäten"
      description="Neueste Einträge zuerst"
    />
  );
}
