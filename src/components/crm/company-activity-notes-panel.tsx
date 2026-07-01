"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, Plus } from "lucide-react";
import { createActivity } from "@/app/(crm)/activities/actions";
import {
  completeTaskWithOptionalFollowUp,
  createTask,
  updateTaskOwner,
} from "@/app/(crm)/tasks/actions";
import { ActivityDeleteButton } from "@/components/crm/activity-delete-button";
import { ActivityEditModalButton } from "@/components/crm/activity-edit-modal-button";
import { TaskOwnerSelect } from "@/components/crm/task-owner-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell } from "@/components/crm/modal-shell";
import { TaskDeleteButton } from "@/components/crm/task-delete-button";
import { TaskEditModalButton } from "@/components/crm/task-edit-modal-button";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityWithContext } from "@/lib/db/activities";
import {
  activityDirectionLabels,
  activityTypeLabels,
  outreachKindLabels,
  outreachOutcomeLabels,
  painStatementLabels,
} from "@/lib/activities/constants";
import type { Contact } from "@/lib/db/contacts";
import type { TeamProfile } from "@/lib/db/profiles";
import { ownerDisplayName } from "@/lib/list-display";
import type { TaskWithContext } from "@/lib/db/tasks";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  truncateTaskTitle,
} from "@/lib/tasks/limits";
import { cn } from "@/lib/utils";
import type { ValueProp } from "@/lib/db/value-props";
import type { TaskStatus } from "@/types/database";

const taskStatusLabels: Record<TaskStatus, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  done: "Erledigt",
  canceled: "Abgebrochen",
};

type CompanyActivityNotesPanelProps = {
  companyId: string;
  companyName: string;
  contacts: Contact[];
  tasks: TaskWithContext[];
  activities: ActivityWithContext[];
  currentProfileId: string;
  valueProps: ValueProp[];
  teamProfiles: TeamProfile[];
  error?: string;
};

type Filter = "all" | "tasks" | "activities";
type Modal = "task" | "activity" | null;

export function CompanyActivityNotesPanel({
  companyId,
  companyName,
  contacts,
  tasks,
  activities,
  currentProfileId,
  valueProps,
  teamProfiles,
  error,
}: CompanyActivityNotesPanelProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [modal, setModal] = useState<Modal>(null);
  const items = useMemo(
    () =>
      [
        ...tasks.map((task) => ({
          kind: "task" as const,
          id: task.id,
          date: task.created_at,
          task,
        })),
        ...activities.map((activity) => ({
          kind: "activity" as const,
          id: activity.id,
          date: activity.occurred_at,
          activity,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [activities, tasks],
  );
  const visibleItems = items.filter((item) => {
    if (filter === "tasks") {
      return item.kind === "task";
    }
    if (filter === "activities") {
      return item.kind === "activity";
    }
    return true;
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Tasks und Aktivitäten</CardTitle>
            <CardDescription>
              Aufgaben und CRM-Aktivitäten chronologisch sortiert.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setModal("task")}
            >
              <Plus aria-hidden="true" />
              Task
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setModal("activity")}
            >
              <Plus aria-hidden="true" />
              Aktivität
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Alle <Count>{items.length}</Count>
            </FilterButton>
            <FilterButton
              active={filter === "tasks"}
              onClick={() => setFilter("tasks")}
            >
              Tasks <Count>{tasks.length}</Count>
            </FilterButton>
            <FilterButton
              active={filter === "activities"}
              onClick={() => setFilter("activities")}
            >
              Aktivitäten <Count>{activities.length}</Count>
            </FilterButton>
          </div>

          {visibleItems.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
              <CalendarDays
                className="mb-3 size-5 text-neutral-400"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-neutral-950">
                Noch keine Einträge
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Erstelle eine Task oder Aktivität für diesen Kontext.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleItems.map((item) =>
                item.kind === "task" ? (
                  <TaskRow
                    key={`task-${item.id}`}
                    contacts={contacts}
                    task={item.task}
                    returnTo={`/companies/${companyId}`}
                    teamProfiles={teamProfiles}
                  />
                ) : (
                  <ActivityRow
                    key={`activity-${item.id}`}
                    activity={item.activity}
                    companyName={companyName}
                    returnTo={`/companies/${companyId}`}
                    valueProps={valueProps}
                  />
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {modal === "task" ? (
        <TaskModal
          companyId={companyId}
          contacts={contacts}
          currentProfileId={currentProfileId}
          onClose={() => setModal(null)}
          teamProfiles={teamProfiles}
        />
      ) : null}
      {modal === "activity" ? (
        <CompanyActivityModal
          companyId={companyId}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}

function TaskRow({
  contacts,
  task,
  returnTo,
  teamProfiles,
}: {
  contacts: Contact[];
  task: TaskWithContext;
  returnTo: string;
  teamProfiles: TeamProfile[];
}) {
  const overdue = isOverdue(task.due_date, task.status);
  const done = task.status === "done";

  return (
    <details
      className={cn(
        "group rounded-md border border-l-4",
        overdue
          ? "border-red-200 border-l-red-500 bg-red-50/80"
          : done
            ? "border-neutral-200 border-l-neutral-300 bg-neutral-100/80"
            : "border-neutral-300 border-l-neutral-950 bg-white",
      )}
    >
      <summary
        className={cn(
          "grid cursor-pointer list-none items-center gap-3 px-4 py-3 transition sm:grid-cols-[minmax(220px,1.6fr)_minmax(120px,0.8fr)_130px_130px_110px_24px] [&::-webkit-details-marker]:hidden",
          overdue
            ? "hover:bg-red-50"
            : done
              ? "hover:bg-neutral-100"
              : "hover:bg-neutral-50",
        )}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded bg-white px-2 py-0.5 text-[11px]",
                overdue
                  ? "border-red-200 text-red-700"
                  : done
                    ? "border-neutral-200 text-neutral-500"
                    : "border-neutral-300 text-neutral-950",
              )}
            >
              Task
            </Badge>
            <p
              className={cn(
                "truncate text-sm font-medium",
                done ? "text-neutral-500" : "text-neutral-950",
              )}
            >
              {task.title}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">Zuständigkeit</p>
          <TaskOwnerInlineSelect
            returnTo={returnTo}
            task={task}
            teamProfiles={teamProfiles}
          />
        </div>
        <MetaValue
          label="Fälligkeit"
          value={task.due_date ? formatDate(task.due_date) : "-"}
        />
        <MetaValue label="Erstellt" value={formatDate(task.created_at)} />
        <LocalTaskStatusBadge dueDate={task.due_date} status={task.status} />
        <ChevronDown
          className="size-4 text-neutral-500 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-neutral-200 px-4 py-4">
        <p className="text-xs font-medium text-neutral-500">Inhalt</p>
        <div className="mt-1 text-sm text-neutral-700">
          {task.description ? (
            <p className="whitespace-pre-wrap leading-6">{task.description}</p>
          ) : (
            <p className="text-neutral-500">Keine weiteren Informationen.</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
          <TaskEditModalButton
            contacts={contacts}
            returnTo={returnTo}
            task={task}
            teamProfiles={teamProfiles}
          />
          <TaskDeleteButton
            taskId={task.id}
            companyId={task.company_id}
            dealId={task.deal_id}
            returnTo={returnTo}
          />
          {task.status !== "done" && task.status !== "canceled" ? (
            <TaskCompleteButton
              task={task}
              returnTo={returnTo}
              teamProfiles={teamProfiles}
            />
          ) : null}
        </div>
      </div>
    </details>
  );
}

function TaskOwnerInlineSelect({
  returnTo,
  task,
  teamProfiles,
}: {
  returnTo: string;
  task: TaskWithContext;
  teamProfiles: TeamProfile[];
}) {
  const options = teamProfiles.filter(
    (profile) => profile.status === "active" || profile.id === task.owner_id,
  );

  if (options.length === 0) {
    return (
      <p className="truncate text-sm text-neutral-700">
        {ownerDisplayName(task.owner)}
      </p>
    );
  }

  return (
    <form
      action={updateTaskOwner}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <input type="hidden" name="task_id" value={task.id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <select
        aria-label="Zuständigkeit ändern"
        name="owner_id"
        defaultValue={task.owner_id}
        className="h-7 max-w-full cursor-pointer truncate rounded border border-transparent bg-transparent px-1.5 text-sm text-neutral-700 outline-none transition hover:border-neutral-200 hover:bg-white focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-950/10"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {options.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {ownerDisplayName(profile)}
            {profile.status === "inactive" ? " (inaktiv)" : ""}
          </option>
        ))}
      </select>
    </form>
  );
}

function TaskCompleteButton({
  task,
  returnTo,
  teamProfiles,
}: {
  task: TaskWithContext;
  returnTo: string;
  teamProfiles: TeamProfile[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [createFollowUp, setCreateFollowUp] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setIsOpen(true)}>
        <CheckCircle2 aria-hidden="true" />
        Completed
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="Task abschließen"
          title={task.title}
          onClose={() => setIsOpen(false)}
        >
          <form action={completeTaskWithOptionalFollowUp} className="space-y-5">
            <input type="hidden" name="task_id" value={task.id} />
            <input type="hidden" name="return_to" value={returnTo} />

            <div className="rounded-md border border-neutral-200 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="create_follow_up"
                  checked={createFollowUp}
                  onChange={(event) => setCreateFollowUp(event.target.checked)}
                  className="mt-0.5 size-4 rounded border-neutral-300"
                />
                <span>
                  <span className="block text-sm font-medium text-neutral-950">
                    Follow-up-Task erstellen
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    Die neue Task übernimmt Unternehmen, Kontakt und Deal dieser
                    Task.
                  </span>
                </span>
              </label>
            </div>

            {createFollowUp ? (
              <div className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                  <div className="space-y-2">
                    <Label htmlFor={`follow-up-title-${task.id}`}>Titel</Label>
                    <Input
                      id={`follow-up-title-${task.id}`}
                      name="follow_up_title"
                      defaultValue={truncateTaskTitle(`Follow-up: ${task.title}`)}
                      maxLength={TASK_TITLE_MAX_LENGTH}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`follow-up-date-${task.id}`}>
                      Fälligkeit
                    </Label>
                    <Input
                      id={`follow-up-date-${task.id}`}
                      name="follow_up_due_date"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <TaskOwnerSelect
                  id={`follow-up-owner-${task.id}`}
                  name="follow_up_owner_id"
                  defaultOwnerId={task.owner_id}
                  profiles={teamProfiles}
                />
                <div className="space-y-2">
                  <Label htmlFor={`follow-up-description-${task.id}`}>
                    Inhalt
                  </Label>
                  <Textarea
                    id={`follow-up-description-${task.id}`}
                    name="follow_up_description"
                    rows={4}
                    maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                    placeholder="Was soll als Nächstes passieren?"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                <CheckCircle2 aria-hidden="true" />
                Task abschließen
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

function LocalTaskStatusBadge({
  dueDate,
  status,
}: {
  dueDate: string | null;
  status: TaskStatus;
}) {
  if (isOverdue(dueDate, status)) {
    return (
      <Badge
        variant="outline"
        className="whitespace-nowrap border-red-200 bg-red-50 text-red-700"
      >
        Überfällig
      </Badge>
    );
  }

  if (status === "open") {
    return (
      <Badge className="whitespace-nowrap border-neutral-950 bg-neutral-950 text-white">
        Offen
      </Badge>
    );
  }

  if (status === "done") {
    return (
      <Badge
        variant="outline"
        className="whitespace-nowrap border-green-200 bg-green-50 text-green-700"
      >
        Erledigt
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="whitespace-nowrap border-neutral-200 bg-neutral-50 text-neutral-700"
    >
      {taskStatusLabels[status]}
    </Badge>
  );
}

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done" || status === "canceled") {
    return false;
  }

  return dueDate <= todayDateString();
}

function todayDateString() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function ActivityRow({
  activity,
  companyName,
  returnTo,
  valueProps,
}: {
  activity: ActivityWithContext;
  companyName: string;
  returnTo: string;
  valueProps: ValueProp[];
}) {
  const contactName = activity.contact
    ? `${activity.contact.first_name} ${activity.contact.last_name}`.trim()
    : "Kein Kontakt";

  return (
    <details className="group rounded-md border border-neutral-200 border-l-4 border-l-neutral-200 bg-white">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:grid-cols-[minmax(220px,1.5fr)_minmax(160px,1fr)_minmax(160px,1fr)_150px_24px] [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-600"
            >
              Aktivität
            </Badge>
            <span className="truncate text-sm font-medium text-neutral-950">
              {activityTypeLabels[activity.type]}
            </span>
            <EditedBy activity={activity} />
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {activity.title}
          </p>
        </div>
        <MetaValue label="Kontakt" value={contactName} />
        <MetaValue label="Unternehmen" value={companyName} />
        <div>
          <p className="text-xs font-medium text-neutral-500">Zeitpunkt</p>
          <p className="whitespace-nowrap text-sm text-neutral-700">
            {formatDateTime(activity.occurred_at)}
          </p>
        </div>
        <ChevronDown
          className="size-4 text-neutral-500 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-medium text-neutral-500">Inhalt</p>
            <div className="mt-1 text-sm text-neutral-700">
              {activity.body ? (
                <p className="whitespace-pre-wrap leading-6">{activity.body}</p>
              ) : (
                <p className="text-neutral-500">
                  Keine weiteren Informationen.
                </p>
              )}
            </div>
          </div>
          <dl className="grid min-w-44 content-start gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-neutral-500">Richtung</dt>
              <dd className="mt-0.5 text-neutral-700">
                {activityDirectionLabels[activity.direction]}
              </dd>
            </div>
            {activity.outreach_kind ? (
              <ActivityMeta
                label="Outreach-Art"
                value={outreachKindLabels[activity.outreach_kind]}
              />
            ) : null}
            {activity.outreach_outcome ? (
              <ActivityMeta
                label="Outcome"
                value={outreachOutcomeLabels[activity.outreach_outcome]}
              />
            ) : null}
            {activity.outreach_outcome ? (
              <ActivityMeta
                label="Pain Aussage"
                value={painStatementLabels[activity.pain_statement]}
              />
            ) : null}
            {activity.value_prop ? (
              <ActivityMeta
                label="Value Prop"
                value={`${activity.value_prop.code}: ${activity.value_prop.label}`}
              />
            ) : null}
          </dl>
        </div>
        <div className="mt-4 flex justify-end gap-1 border-t border-neutral-100 pt-3">
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
    </details>
  );
}

function ActivityMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-neutral-700">{value}</dd>
    </div>
  );
}

function MetaValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="truncate text-sm text-neutral-700">{value}</p>
    </div>
  );
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

function TaskModal({
  companyId,
  contacts,
  currentProfileId,
  onClose,
  teamProfiles,
}: {
  companyId: string;
  contacts: Contact[];
  currentProfileId: string;
  onClose: () => void;
  teamProfiles: TeamProfile[];
}) {
  return (
    <ModalShell eyebrow="Task" title="Task erstellen" onClose={onClose}>
      <form action={createTask} className="space-y-4">
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="status" value="open" />
        <input
          type="hidden"
          name="return_to"
          value={`/companies/${companyId}`}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor="company-task-title">Aufgabe</Label>
            <Input
              id="company-task-title"
              name="title"
              required
              maxLength={TASK_TITLE_MAX_LENGTH}
              placeholder="Follow-up vorbereiten"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-task-due-date">Fällig am</Label>
            <Input
              id="company-task-due-date"
              name="due_date"
              type="date"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-task-contact">Kontakt</Label>
            <select
              id="company-task-contact"
              name="contact_id"
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
            >
              <option value="">Nur Unternehmen</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
          </div>

          <TaskOwnerSelect
            id="company-task-owner"
            defaultOwnerId={currentProfileId}
            profiles={teamProfiles}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-task-description">Task-Inhalt</Label>
          <Textarea
            id="company-task-description"
            name="description"
            rows={4}
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            placeholder="Was soll als nächstes passieren?"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit">Task speichern</Button>
        </div>
      </form>
    </ModalShell>
  );
}

function CompanyActivityModal({
  companyId,
  onClose,
}: {
  companyId: string;
  onClose: () => void;
}) {
  return (
    <ModalShell
      eyebrow="Aktivität"
      title="Unternehmensaktivität erfassen"
      onClose={onClose}
    >
      <form action={createActivity} className="space-y-4">
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="type" value="note" />
        <input
          type="hidden"
          name="return_to"
          value={`/companies/${companyId}`}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <Label htmlFor="company-note-title">Titel</Label>
            <Input
              id="company-note-title"
              name="title"
              required
              placeholder="Interne Unternehmensaktivität"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-note-date">Datum und Uhrzeit</Label>
            <Input
              id="company-note-date"
              name="occurred_at"
              type="datetime-local"
              defaultValue={defaultDateTimeValue()}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-note-body">Inhalt</Label>
          <Textarea
            id="company-note-body"
            name="body"
            rows={6}
            required
            placeholder="Was ist passiert? Warum ist es relevant?"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit">Aktivität speichern</Button>
        </div>
      </form>
    </ModalShell>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Count({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs">
      {children}
    </span>
  );
}

function defaultDateTimeValue() {
  const date = new Date();
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
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
