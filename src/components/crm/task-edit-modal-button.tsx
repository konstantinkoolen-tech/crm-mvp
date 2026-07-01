"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { updateTask } from "@/app/(crm)/tasks/actions";
import { ModalShell } from "@/components/crm/modal-shell";
import { TaskOwnerSelect } from "@/components/crm/task-owner-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/db/contacts";
import type { TeamProfile } from "@/lib/db/profiles";
import type { TaskWithContext } from "@/lib/db/tasks";
import { taskStatusLabels, taskStatuses } from "@/lib/tasks/constants";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";

type TaskEditModalButtonProps = {
  contacts?: Contact[];
  returnTo: string;
  task: TaskWithContext;
  teamProfiles: TeamProfile[];
};

export function TaskEditModalButton({
  contacts = [],
  returnTo,
  task,
  teamProfiles,
}: TaskEditModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
        aria-label="Task bearbeiten"
        title="Task bearbeiten"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Pencil aria-hidden="true" />
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="Task"
          title="Task bearbeiten"
          onClose={() => setIsOpen(false)}
        >
          <form action={updateTask} className="space-y-5">
            <input type="hidden" name="task_id" value={task.id} />
            <input
              type="hidden"
              name="company_id"
              value={task.company_id ?? ""}
            />
            <input type="hidden" name="deal_id" value={task.deal_id ?? ""} />
            <input type="hidden" name="return_to" value={returnTo} />

            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor={`task-title-${task.id}`}>Aufgabe</Label>
                <Input
                  id={`task-title-${task.id}`}
                  name="title"
                  defaultValue={task.title}
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`task-due-date-${task.id}`}>Fällig am</Label>
                <Input
                  id={`task-due-date-${task.id}`}
                  name="due_date"
                  type="date"
                  defaultValue={task.due_date ?? ""}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`task-contact-${task.id}`}>Kontakt</Label>
                <select
                  id={`task-contact-${task.id}`}
                  name="contact_id"
                  defaultValue={task.contact_id ?? ""}
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
                id={`task-owner-${task.id}`}
                defaultOwnerId={task.owner_id}
                profiles={teamProfiles}
              />

              <div className="space-y-2">
                <Label htmlFor={`task-status-${task.id}`}>Status</Label>
                <select
                  id={`task-status-${task.id}`}
                  name="status"
                  defaultValue={task.status}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {taskStatuses.map((status) => (
                    <option key={status} value={status}>
                      {taskStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`task-description-${task.id}`}>Task-Inhalt</Label>
              <Textarea
                id={`task-description-${task.id}`}
                name="description"
                rows={5}
                defaultValue={task.description ?? ""}
                maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                placeholder="Was soll als nächstes passieren?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}
