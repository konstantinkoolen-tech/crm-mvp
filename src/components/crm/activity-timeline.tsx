import { CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteActivity } from "@/app/(crm)/activities/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { activityTypeLabels, type ActivityWithContext } from "@/lib/db/activities";

type ActivityTimelineProps = {
  activities: ActivityWithContext[];
  returnTo: string;
  title?: string;
  description?: string;
};

export function ActivityTimeline({
  activities,
  returnTo,
  title = "Aktivitaeten",
  description = "Chronologische Timeline",
}: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <CalendarClock className="mb-3 size-5 text-neutral-400" aria-hidden="true" />
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Aktivitaeten
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Erstelle die erste Notiz fuer diesen Kontext.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-4 border-l border-neutral-200 pl-4">
            {activities.map((activity) => (
              <li key={activity.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 size-3 rounded-full border-2 border-white bg-neutral-300" />
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                          {activityTypeLabels[activity.type]}
                        </span>
                        <time className="text-xs text-neutral-500">
                          {formatDateTime(activity.occurred_at)}
                        </time>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-neutral-950">
                        {activity.title}
                      </h3>
                      {activity.body ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                          {activity.body}
                        </p>
                      ) : null}
                      <ContextLinks activity={activity} />
                    </div>

                    <form action={deleteActivity} className="shrink-0">
                      <input type="hidden" name="activity_id" value={activity.id} />
                      {activity.company_id ? (
                        <input type="hidden" name="company_id" value={activity.company_id} />
                      ) : null}
                      {activity.deal_id ? (
                        <input type="hidden" name="deal_id" value={activity.deal_id} />
                      ) : null}
                      <input type="hidden" name="return_to" value={returnTo} />
                      <Button type="submit" variant="ghost" size="sm">
                        <Trash2 aria-hidden="true" />
                        Loeschen
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function ContextLinks({ activity }: { activity: ActivityWithContext }) {
  if (!activity.company && !activity.deal) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
      {activity.company ? (
        <Link href={`/companies/${activity.company.id}`} className="hover:underline">
          {activity.company.name}
        </Link>
      ) : null}
      {activity.deal ? (
        <Link href={`/deals/${activity.deal.id}`} className="hover:underline">
          {activity.deal.title}
        </Link>
      ) : null}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
