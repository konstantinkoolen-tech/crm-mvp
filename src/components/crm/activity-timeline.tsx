"use client";

import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityDeleteButton } from "@/components/crm/activity-delete-button";
import { ActivityEditModalButton } from "@/components/crm/activity-edit-modal-button";
import { ListFilterBar } from "@/components/crm/list-filter-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  activityDirectionLabels,
  activityTypeLabels,
  outreachKindLabels,
  outreachOutcomeLabels,
  painStatementLabels,
} from "@/lib/activities/constants";
import type { ActivityWithContext } from "@/lib/db/activities";
import type { ValueProp } from "@/lib/db/value-props";
import { ownerDisplayName } from "@/lib/list-display";

type ActivityTimelineProps = {
  activities: ActivityWithContext[];
  returnTo: string;
  valueProps: ValueProp[];
  title?: string;
  description?: string;
};

type ActivitySort =
  | "occurred_desc"
  | "occurred_asc"
  | "created_desc"
  | "title_asc";

const activityStatusLabels = {
  planned: "Geplant",
  completed: "Abgeschlossen",
  canceled: "Abgebrochen",
};

export function ActivityTimeline({
  activities,
  returnTo,
  valueProps,
  title = "Aktivitäten",
  description = "Chronologische Timeline",
}: ActivityTimelineProps) {
  const [sort, setSort] = useState<ActivitySort>("occurred_desc");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>();
    for (const activity of activities) {
      if (activity.owner) {
        owners.set(activity.owner.id, ownerDisplayName(activity.owner));
      }
    }
    return Array.from(owners, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [activities]);

  const visibleActivities = useMemo(() => {
    return [...activities]
      .filter((activity) => owner === "all" || activity.owner_id === owner)
      .filter((activity) => status === "all" || activity.status === status)
      .filter((activity) => type === "all" || activity.type === type)
      .sort((a, b) => {
        if (sort === "occurred_asc") {
          return dateValue(a.occurred_at) - dateValue(b.occurred_at);
        }
        if (sort === "created_desc") {
          return dateValue(b.created_at) - dateValue(a.created_at);
        }
        if (sort === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        return dateValue(b.occurred_at) - dateValue(a.occurred_at);
      });
  }, [activities, owner, sort, status, type]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} · {visibleActivities.length} von {activities.length}{" "}
          Einträgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ListFilterBar
            sortValue={sort}
            sortOptions={[
              { value: "occurred_desc", label: "Neueste zuerst" },
              { value: "occurred_asc", label: "Älteste zuerst" },
              { value: "created_desc", label: "Erstellt zuletzt" },
              { value: "title_asc", label: "Titel A-Z" },
            ]}
            onSortChange={(value) => setSort(value as ActivitySort)}
            ownerValue={owner}
            ownerOptions={ownerOptions}
            onOwnerChange={setOwner}
            statusValue={status}
            statusOptions={Object.entries(activityStatusLabels).map(
              ([value, label]) => ({
                value,
                label,
              }),
            )}
            onStatusChange={setStatus}
            typeValue={type}
            typeOptions={Object.entries(activityTypeLabels).map(
              ([value, label]) => ({
                value,
                label,
              }),
            )}
            onTypeChange={setType}
          />
        ) : null}
        {activities.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <CalendarClock
              className="mb-3 size-5 text-neutral-400"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Aktivitäten
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Erfasse die erste Aktivität für diesen Kontext.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-4 border-l border-neutral-200 pl-4">
            {visibleActivities.map((activity) => (
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
                        <EditedBy activity={activity} />
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-neutral-950">
                        {activity.title}
                      </h3>
                      <div className="mt-1 text-xs text-neutral-500">
                        Zuständig: {ownerDisplayName(activity.owner)}
                      </div>
                      {activity.body ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                          {activity.body}
                        </p>
                      ) : null}
                      <OutreachDetails activity={activity} />
                      <ContextLinks activity={activity} />
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <ActivityEditModalButton
                        activity={activity}
                        returnTo={returnTo}
                        valueProps={valueProps}
                      />
                      <ActivityDeleteButton
                        activityId={activity.id}
                        companyId={activity.company_id}
                        dealId={activity.deal_id}
                        returnTo={returnTo}
                      />
                    </div>
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

function OutreachDetails({ activity }: { activity: ActivityWithContext }) {
  if (
    !activity.outreach_kind &&
    !activity.outreach_outcome &&
    !activity.value_prop &&
    activity.pain_statement === "no_statement"
  ) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
      {activity.outreach_kind ? (
        <span className="rounded bg-neutral-100 px-2 py-1 font-medium text-neutral-800">
          Outreach: {outreachKindLabels[activity.outreach_kind]}
        </span>
      ) : null}
      <span className="rounded bg-neutral-100 px-2 py-1">
        Richtung: {activityDirectionLabels[activity.direction]}
      </span>
      {activity.outreach_outcome ? (
        <span className="rounded bg-neutral-100 px-2 py-1">
          Outcome: {outreachOutcomeLabels[activity.outreach_outcome]}
        </span>
      ) : null}
      {activity.outreach_outcome ? (
        <span className="rounded bg-neutral-100 px-2 py-1">
          Pain: {painStatementLabels[activity.pain_statement]}
        </span>
      ) : null}
      {activity.value_prop ? (
        <span className="rounded bg-neutral-100 px-2 py-1">
          Value Prop: {activity.value_prop.code}: {activity.value_prop.label}
        </span>
      ) : null}
    </div>
  );
}

function ContextLinks({ activity }: { activity: ActivityWithContext }) {
  if (!activity.company && !activity.contact && !activity.deal) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
      {activity.company ? (
        <Link
          href={`/companies/${activity.company.id}`}
          className="hover:underline"
        >
          {activity.company.name}
        </Link>
      ) : null}
      {activity.contact ? (
        <span>
          {activity.contact.first_name} {activity.contact.last_name}
        </span>
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

function dateValue(value: string) {
  return new Date(value).getTime();
}

function EditedBy({ activity }: { activity: ActivityWithContext }) {
  if (!activity.last_editor || !isEdited(activity)) {
    return null;
  }

  return (
    <span className="inline-flex max-w-full items-center rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 ring-1 ring-neutral-200">
      <span className="truncate">
        edited by {ownerDisplayName(activity.last_editor)}
      </span>
    </span>
  );
}

function isEdited(activity: ActivityWithContext) {
  return dateValue(activity.updated_at) > dateValue(activity.created_at) + 1000;
}
