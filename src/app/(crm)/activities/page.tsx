import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { listActivities } from "@/lib/db/activities";
import { listActiveValueProps } from "@/lib/db/value-props";

export default function ActivitiesPage() {
  const dataPromise = Promise.all([listActivities(), listActiveValueProps()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Aktivitäten</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Notizen, Calls, E-Mails und Meetings chronologisch über alle Kontexte.
        </p>
      </div>
      <ActivitiesList dataPromise={dataPromise} />
    </section>
  );
}

async function ActivitiesList({
  dataPromise,
}: {
  dataPromise: Promise<
    [
      Awaited<ReturnType<typeof listActivities>>,
      Awaited<ReturnType<typeof listActiveValueProps>>,
    ]
  >;
}) {
  const [activities, valueProps] = await dataPromise;

  return (
    <ActivityTimeline
      activities={activities}
      returnTo="/activities"
      valueProps={valueProps}
      title="Alle Aktivitäten"
      description="Neueste Einträge zuerst"
    />
  );
}
