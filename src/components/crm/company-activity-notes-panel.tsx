"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { createActivity } from "@/app/(crm)/activities/actions";
import { createTask } from "@/app/(crm)/tasks/actions";
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
import { Textarea } from "@/components/ui/textarea";
import type { ActivityWithContext } from "@/lib/db/activities";
import type { Contact } from "@/lib/db/contacts";
import type { TaskWithContext } from "@/lib/db/tasks";
import type { TaskStatus } from "@/types/database";

const taskStatusLabels: Record<TaskStatus, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  done: "Erledigt",
  canceled: "Abgebrochen",
};

type CompanyActivityNotesPanelProps = {
  companyId: string;
  contacts: Contact[];
  tasks: TaskWithContext[];
  activities: ActivityWithContext[];
  error?: string;
};

type Filter = "all" | "tasks" | "notes";
type Modal = "task" | "note" | null;

export function CompanyActivityNotesPanel({
  companyId,
  contacts,
  tasks,
  activities,
  error,
}: CompanyActivityNotesPanelProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [modal, setModal] = useState<Modal>(null);
  const notes = activities.filter((activity) => activity.type === "note");
  const items = useMemo(
    () =>
      [
        ...tasks.map((task) => ({
          kind: "task" as const,
          id: task.id,
          date: task.due_date ?? task.created_at,
          task,
        })),
        ...notes.map((note) => ({
          kind: "note" as const,
          id: note.id,
          date: note.occurred_at,
          note,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notes, tasks],
  );
  const visibleItems = items.filter((item) => {
    if (filter === "tasks") {
      return item.kind === "task";
    }
    if (filter === "notes") {
      return item.kind === "note";
    }
    return true;
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Aktivitaeten und Notizen</CardTitle>
            <CardDescription>
              Tasks und Unternehmensnotizen chronologisch sortiert.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setModal("task")}>
              <Plus aria-hidden="true" />
              Task
            </Button>
            <Button type="button" size="sm" onClick={() => setModal("note")}>
              <Plus aria-hidden="true" />
              Notiz
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
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              Alle <Count>{items.length}</Count>
            </FilterButton>
            <FilterButton active={filter === "tasks"} onClick={() => setFilter("tasks")}>
              Tasks <Count>{tasks.length}</Count>
            </FilterButton>
            <FilterButton active={filter === "notes"} onClick={() => setFilter("notes")}>
              Notizen <Count>{notes.length}</Count>
            </FilterButton>
          </div>

          {visibleItems.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
              <CalendarDays className="mb-3 size-5 text-neutral-400" aria-hidden="true" />
              <p className="text-sm font-medium text-neutral-950">
                Noch keine Eintraege
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Erstelle eine Task oder Notiz fuer diesen Kontext.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleItems.map((item) =>
                item.kind === "task" ? (
                  <TaskRow key={`task-${item.id}`} task={item.task} />
                ) : (
                  <NoteRow key={`note-${item.id}`} note={item.note} />
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
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "note" ? (
        <NoteModal companyId={companyId} onClose={() => setModal(null)} />
      ) : null}
    </>
  );
}

function TaskRow({ task }: { task: TaskWithContext }) {
  return (
    <details className="group rounded-md border border-neutral-200 bg-white">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:grid-cols-[1fr_160px_120px] [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-950">{task.title}</p>
          <p className="mt-1 text-xs text-neutral-500">Task</p>
        </div>
        <div className="text-sm text-neutral-700">
          {task.due_date ? formatDate(task.due_date) : "-"}
        </div>
        <LocalTaskStatusBadge dueDate={task.due_date} status={task.status} />
      </summary>
      <div className="border-t border-neutral-200 px-4 py-4 text-sm text-neutral-700">
        {task.description ? (
          <p className="whitespace-pre-wrap leading-6">{task.description}</p>
        ) : (
          <p className="text-neutral-500">Keine weiteren Informationen.</p>
        )}
      </div>
    </details>
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
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
        Ueberfaellig
      </Badge>
    );
  }

  return (
    <Badge variant={status === "done" ? "default" : "secondary"}>
      {taskStatusLabels[status]}
    </Badge>
  );
}

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done" || status === "canceled") {
    return false;
  }

  return dueDate < todayDateString();
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

function NoteRow({ note }: { note: ActivityWithContext }) {
  return (
    <details className="group rounded-md border border-neutral-200 bg-white">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:grid-cols-[1fr_160px_120px] [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-950">{note.title}</p>
          <p className="mt-1 text-xs text-neutral-500">Notiz</p>
        </div>
        <div className="text-sm text-neutral-700">
          {formatDateTime(note.occurred_at)}
        </div>
        <span className="rounded bg-neutral-100 px-2 py-1 text-center text-xs font-medium text-neutral-700">
          Gespeichert
        </span>
      </summary>
      <div className="border-t border-neutral-200 px-4 py-4 text-sm text-neutral-700">
        {note.body ? (
          <p className="whitespace-pre-wrap leading-6">{note.body}</p>
        ) : (
          <p className="text-neutral-500">Keine weiteren Informationen.</p>
        )}
      </div>
    </details>
  );
}

function TaskModal({
  companyId,
  contacts,
  onClose,
}: {
  companyId: string;
  contacts: Contact[];
  onClose: () => void;
}) {
  return (
    <ModalShell eyebrow="Task" title="Task erstellen" onClose={onClose}>
      <form action={createTask} className="space-y-4">
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="status" value="open" />
        <input type="hidden" name="return_to" value={`/companies/${companyId}`} />

        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor="company-task-title">Aufgabe</Label>
            <Input id="company-task-title" name="title" required placeholder="Follow-up vorbereiten" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-task-due-date">Faellig am</Label>
            <Input id="company-task-due-date" name="due_date" type="date" required />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="company-task-description">Task-Inhalt</Label>
          <Textarea id="company-task-description" name="description" rows={4} placeholder="Was soll als naechstes passieren?" />
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

function NoteModal({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  return (
    <ModalShell eyebrow="Notiz" title="Notiz speichern" onClose={onClose}>
      <form action={createActivity} className="space-y-4">
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="type" value="note" />
        <input type="hidden" name="return_to" value={`/companies/${companyId}`} />

        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <Label htmlFor="company-note-title">Titel</Label>
            <Input id="company-note-title" name="title" required placeholder="Interne Unternehmensnotiz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-note-date">Datum und Uhrzeit</Label>
            <Input id="company-note-date" name="occurred_at" type="datetime-local" defaultValue={defaultDateTimeValue()} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-note-body">Notiz</Label>
          <Textarea id="company-note-body" name="body" rows={6} required placeholder="Was ist passiert? Warum ist es relevant?" />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit">Notiz speichern</Button>
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
    <Button type="button" variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

function Count({ children }: { children: ReactNode }) {
  return <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs">{children}</span>;
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
