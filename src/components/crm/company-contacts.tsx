"use client";

import { ChevronDown, Mail, MessageSquare, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityDeleteButton } from "@/components/crm/activity-delete-button";
import { ActivityEditModalButton } from "@/components/crm/activity-edit-modal-button";
import {
  ContactQuickActions,
  type PendingActivity,
} from "@/components/crm/contact-quick-actions";
import { ContactDeleteForm } from "@/components/crm/contact-delete-form";
import { ContactEditModalButton } from "@/components/crm/contact-edit-modal-button";
import { ContactCreateButton } from "@/components/crm/company-create-buttons";
import { ContactStatusBadge } from "@/components/crm/contact-status-badge";
import { RichTextDisplay } from "@/components/crm/rich-text-display";
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
import type { Contact } from "@/lib/db/contacts";
import type { TeamProfile } from "@/lib/db/profiles";
import type { TaskWithContext } from "@/lib/db/tasks";
import type { ValueProp } from "@/lib/db/value-props";
import { ownerDisplayName } from "@/lib/list-display";
import { isTaskOverdue } from "@/lib/tasks/constants";

type CompanyContactsProps = {
  companyId: string;
  companyName?: string;
  contacts: Contact[];
  activities: ActivityWithContext[];
  currentProfileId: string;
  tasks: TaskWithContext[];
  teamProfiles: TeamProfile[];
  valueProps: ValueProp[];
};

export function CompanyContacts({
  companyId,
  companyName,
  contacts,
  activities,
  currentProfileId,
  tasks,
  teamProfiles,
  valueProps,
}: CompanyContactsProps) {
  const activitiesByContact = new Map<string, ActivityWithContext[]>();
  const tasksByContact = new Map<string, TaskWithContext[]>();

  for (const activity of activities) {
    if (!activity.contact_id) {
      continue;
    }

    const contactActivities =
      activitiesByContact.get(activity.contact_id) ?? [];
    contactActivities.push(activity);
    activitiesByContact.set(activity.contact_id, contactActivities);
  }

  for (const task of tasks) {
    if (!task.contact_id) {
      continue;
    }

    const contactTasks = tasksByContact.get(task.contact_id) ?? [];
    contactTasks.push(task);
    tasksByContact.set(task.contact_id, contactTasks);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Kontakte</CardTitle>
          <CardDescription>
            Ansprechpartner, die diesem Unternehmen zugeordnet sind.
          </CardDescription>
        </div>
        <ContactCreateButton companyId={companyId} companyName={companyName} />
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Kontakte
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Füge die ersten Ansprechpartner für dieses Unternehmen hinzu.
            </p>
            <div className="mt-4">
              <ContactCreateButton
                companyId={companyId}
                companyName={companyName}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 overflow-x-auto">
            <div className="grid min-w-[940px] grid-cols-[minmax(180px,1.2fr)_minmax(120px,0.8fr)_minmax(220px,1.2fr)_152px_220px] gap-4 px-4 text-xs font-medium text-neutral-500 max-lg:hidden">
              <span>Name</span>
              <span>Position</span>
              <span>Kontakt</span>
              <span>Aktivität</span>
              <span className="text-right">Verwalten</span>
            </div>
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                companyId={companyId}
                companyName={companyName}
                activities={activitiesByContact.get(contact.id) ?? []}
                currentProfileId={currentProfileId}
                tasks={tasksByContact.get(contact.id) ?? []}
                teamProfiles={teamProfiles}
                valueProps={valueProps}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactRow({
  contact,
  companyId,
  companyName,
  activities,
  currentProfileId,
  tasks,
  teamProfiles,
  valueProps,
}: {
  contact: Contact;
  companyId: string;
  companyName?: string;
  activities: ActivityWithContext[];
  currentProfileId: string;
  tasks: TaskWithContext[];
  teamProfiles: TeamProfile[];
  valueProps: ValueProp[];
}) {
  const contactName = `${contact.first_name} ${contact.last_name}`;
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>(
    [],
  );
  const activityCount = activities.length + pendingActivities.length;

  useEffect(() => {
    if (pendingActivities.length === 0 || activities.length === 0) {
      return;
    }

    setPendingActivities((current) => {
      const next = current.filter(
        (pendingActivity) =>
          !activities.some((activity) =>
            activityMatchesPending(activity, pendingActivity),
          ),
      );

      return next.length === current.length ? current : next;
    });
  }, [activities, pendingActivities.length]);

  function addPendingActivity(activity: PendingActivity) {
    setPendingActivities((current) => [activity, ...current]);
  }

  return (
    <details className="group rounded-md border border-neutral-200 bg-white">
      <summary className="grid cursor-pointer list-none gap-4 p-4 transition hover:bg-neutral-50 lg:min-w-[940px] lg:grid-cols-[minmax(180px,1.2fr)_minmax(120px,0.8fr)_minmax(220px,1.2fr)_152px_220px] lg:items-center [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <ChevronDown
              className="mt-0.5 size-4 shrink-0 text-neutral-400 transition group-open:rotate-180"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-950">
                  {contactName}
                </span>
                <ContactTaskIndicator tasks={tasks} />
                <ContactStatusBadge status={contact.status} compact />
                <ContactNoteBadge notes={contact.notes} />
              </div>
              {contact.linkedin_url ? (
                <Link
                  href={contact.linkedin_url}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare className="size-3" aria-hidden="true" />
                  LinkedIn
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-sm text-neutral-700">
          {contact.job_title ?? "-"}
        </div>

        <ContactLinks contact={contact} />

        <ContactQuickActions
          contact={contact}
          companyId={companyId}
          contactName={contactName}
          currentProfileId={currentProfileId}
          teamProfiles={teamProfiles}
          valueProps={valueProps}
          onActivitySubmit={addPendingActivity}
        />

        <div className="flex justify-end gap-2">
          <ContactEditModalButton companyName={companyName} contact={contact} />
          <ContactDeleteForm
            contactId={contact.id}
            companyId={contact.company_id}
          />
        </div>
      </summary>

      <div className="border-t border-neutral-200 px-4 py-4">
        <ContactNotesTopline notes={contact.notes} />

        <div className="flex flex-col gap-3 lg:ml-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">
              Aktivitäten mit {contactName}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {activityCount} Einträge
            </p>
          </div>
          <ContactQuickActions
            contact={contact}
            companyId={companyId}
            contactName={contactName}
            currentProfileId={currentProfileId}
            teamProfiles={teamProfiles}
            valueProps={valueProps}
            expanded
            onActivitySubmit={addPendingActivity}
          />
        </div>

        {activityCount === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500 lg:ml-6">
            Noch keine Aktivitäten für diesen Kontakt.
          </div>
        ) : (
          <ol className="mt-4 space-y-3 lg:ml-6">
            {pendingActivities.map((activity) => (
              <PendingActivityItem activity={activity} key={activity.id} />
            ))}
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="rounded-md bg-neutral-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
                      {activityTypeLabels[activity.type]}
                    </span>
                    <time className="text-xs text-neutral-500">
                      {formatDateTime(activity.occurred_at)}
                    </time>
                    <EditedBy activity={activity} />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <ActivityEditModalButton
                      activity={activity}
                      returnTo={`/companies/${companyId}`}
                      valueProps={valueProps}
                    />
                    <ActivityDeleteButton
                      activityId={activity.id}
                      companyId={activity.company_id}
                      dealId={activity.deal_id}
                      returnTo={`/companies/${companyId}`}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-950">
                  {activity.title}
                </p>
                {activity.body ? (
                  <RichTextDisplay
                    className="mt-1 text-sm text-neutral-600"
                    value={activity.body}
                  />
                ) : null}
                <ContactActivityOutreachDetails activity={activity} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}

function activityMatchesPending(
  activity: ActivityWithContext,
  pendingActivity: PendingActivity,
) {
  return (
    activity.type === pendingActivity.type &&
    activity.title === pendingActivity.title &&
    normalizeActivityBody(activity.body) ===
      normalizeActivityBody(pendingActivity.body) &&
    Math.abs(
      new Date(activity.occurred_at).getTime() -
        new Date(pendingActivity.occurredAt).getTime(),
    ) <= 60_000
  );
}

function normalizeActivityBody(value: string | null) {
  return value?.trim() ?? "";
}

function ContactNoteBadge({ notes }: { notes: string | null }) {
  if (!notes?.trim()) {
    return null;
  }

  return (
    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200">
      Notiz
    </span>
  );
}

function ContactNotesTopline({ notes }: { notes: string | null }) {
  const trimmedNotes = notes?.trim();

  if (!trimmedNotes) {
    return null;
  }

  return (
    <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 lg:ml-6">
      <span className="font-medium text-neutral-950">Notizen: </span>
      <RichTextDisplay className="mt-1 leading-6" value={trimmedNotes} />
    </div>
  );
}

function ContactTaskIndicator({ tasks }: { tasks: TaskWithContext[] }) {
  const openTasks = tasks.filter(
    (task) => task.status === "open" || task.status === "in_progress",
  );

  if (openTasks.length === 0) {
    return null;
  }

  const hasOverdueTask = openTasks.some(isTaskOverdue);
  const label = hasOverdueTask
    ? "Mindestens eine überfällige Aktivität"
    : "Mindestens eine offene Aktivität";

  return (
    <span
      className={`size-2 shrink-0 rounded-full ${
        hasOverdueTask ? "bg-red-600" : "bg-neutral-950"
      }`}
      role="img"
      aria-label={label}
      title={label}
    />
  );
}

function PendingActivityItem({ activity }: { activity: PendingActivity }) {
  return (
    <li className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="animate-pulse">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-neutral-500 ring-1 ring-neutral-200">
            {activityTypeLabels[activity.type]}
          </span>
          <span className="text-xs text-neutral-400">
            {formatDateTime(activity.occurredAt)}
          </span>
          <span className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-500">
            Wird gespeichert...
          </span>
        </div>
        <div className="mt-2 h-4 w-64 max-w-full rounded bg-neutral-200" />
        <div className="mt-2 space-y-1.5">
          <div className="h-3 w-full rounded bg-neutral-200" />
          <div className="h-3 w-2/3 rounded bg-neutral-200" />
        </div>
      </div>
      <span className="sr-only">{activity.title} wird gespeichert.</span>
    </li>
  );
}

function ContactActivityOutreachDetails({
  activity,
}: {
  activity: ActivityWithContext;
}) {
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
        <span className="rounded bg-white px-2 py-1 font-medium text-neutral-800 ring-1 ring-neutral-200">
          Outreach: {outreachKindLabels[activity.outreach_kind]}
        </span>
      ) : null}
      <span className="rounded bg-white px-2 py-1 ring-1 ring-neutral-200">
        Richtung: {activityDirectionLabels[activity.direction]}
      </span>
      {activity.outreach_outcome ? (
        <span className="rounded bg-white px-2 py-1 ring-1 ring-neutral-200">
          Outcome: {outreachOutcomeLabels[activity.outreach_outcome]}
        </span>
      ) : null}
      {activity.outreach_outcome ? (
        <span className="rounded bg-white px-2 py-1 ring-1 ring-neutral-200">
          Pain: {painStatementLabels[activity.pain_statement]}
        </span>
      ) : null}
      {activity.value_prop ? (
        <span className="rounded bg-white px-2 py-1 ring-1 ring-neutral-200">
          Value Prop: {activity.value_prop.code}: {activity.value_prop.label}
        </span>
      ) : null}
    </div>
  );
}

function ContactLinks({ contact }: { contact: Contact }) {
  return (
    <div className="space-y-1 text-sm text-neutral-700">
      {contact.email ? (
        <div className="flex items-center gap-2">
          <Mail className="size-3.5 text-neutral-400" aria-hidden="true" />
          <Link href={`mailto:${contact.email}`} className="hover:underline">
            {contact.email}
          </Link>
        </div>
      ) : null}
      {contact.phone ? (
        <div className="flex items-center gap-2">
          <Phone className="size-3.5 text-neutral-400" aria-hidden="true" />
          <Link href={`tel:${contact.phone}`} className="hover:underline">
            {contact.phone}
          </Link>
        </div>
      ) : null}
      {!contact.email && !contact.phone ? "-" : null}
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
  return (
    new Date(activity.updated_at).getTime() >
    new Date(activity.created_at).getTime() + 1000
  );
}
