"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Mail, MessageSquare, Phone, Plus, X } from "lucide-react";
import { createActivity } from "@/app/(crm)/activities/actions";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/db/contacts";
import type { ActivityType } from "@/types/database";

type ContactQuickActionsProps = {
  contact: Contact;
  companyId: string;
  contactName: string;
  expanded?: boolean;
};

type QuickAction = {
  type: ActivityType;
  label: string;
  icon: "linkedin" | "phone" | "mail" | "meeting";
};

const actions: QuickAction[] = [
  { type: "linkedin_message", label: "LinkedIn Message", icon: "linkedin" },
  { type: "call", label: "Telefonat", icon: "phone" },
  { type: "email", label: "E-Mail", icon: "mail" },
  { type: "meeting", label: "Meeting", icon: "meeting" },
];

export function ContactQuickActions({
  contact,
  companyId,
  contactName,
  expanded = false,
}: ContactQuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [dateTime, setDateTime] = useState(() => defaultDateTimeValue());
  const [includeTask, setIncludeTask] = useState(false);

  const occurredAt = useMemo(() => {
    const parsed = new Date(dateTime);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }, [dateTime]);

  return (
    <>
      <div className={expanded ? "flex flex-wrap gap-2" : "flex flex-nowrap gap-1"}>
        {actions.map((action) => (
          <Button
            key={action.type}
            type="button"
            variant="outline"
            size="sm"
            className={
              expanded
                ? "h-8 px-2 text-xs"
                : "size-8 shrink-0 rounded-md p-0 text-neutral-600 hover:text-neutral-950"
            }
            title={`${action.label} hinzufuegen`}
            aria-label={`${action.label} hinzufuegen`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedAction(action);
              setIncludeTask(false);
            }}
          >
            <ActionIcon icon={action.icon} />
            <span className={expanded ? "inline" : "sr-only"}>{action.label}</span>
          </Button>
        ))}
      </div>

      {selectedAction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-dialog-title"
          onClick={() => setSelectedAction(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Aktivitaet
                </p>
                <h2
                  id="activity-dialog-title"
                  className="mt-1 text-lg font-semibold text-neutral-950"
                >
                  {selectedAction.label} mit {contactName}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Dialog schliessen"
                onClick={() => setSelectedAction(null)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <form action={createActivity} className="mt-5 space-y-4">
              <input type="hidden" name="company_id" value={companyId} />
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="type" value={selectedAction.type} />
              <input
                type="hidden"
                name="title"
                value={`${selectedAction.label} mit ${contactName}`}
              />
              <input type="hidden" name="occurred_at" value={occurredAt} />
              {includeTask ? (
                <input type="hidden" name="create_task" value="true" />
              ) : null}
              <input type="hidden" name="return_to" value={`/companies/${companyId}`} />

              <label className="block">
                <span className="text-sm font-medium text-neutral-700">
                  Datum und Uhrzeit
                </span>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(event) => setDateTime(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-neutral-700">
                  Inhalt der Aktivitaet
                </span>
                <textarea
                  name="body"
                  rows={5}
                  required
                  placeholder="Kurze Zusammenfassung, Ergebnis oder naechster Schritt..."
                  className="mt-1 w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                />
              </label>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant={includeTask ? "default" : "outline"}
                  size="icon"
                  className="size-9 rounded-full"
                  aria-label={
                    includeTask ? "Task-Erstellung entfernen" : "Task erstellen"
                  }
                  title={includeTask ? "Task-Erstellung entfernen" : "Task erstellen"}
                  onClick={() => setIncludeTask((value) => !value)}
                >
                  <Plus
                    className={includeTask ? "rotate-45 transition" : "transition"}
                    aria-hidden="true"
                  />
                </Button>
              </div>

              {includeTask ? (
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      Follow-up Task
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Wird zusammen mit der Aktivitaet gespeichert.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-neutral-700">
                        Aufgabe
                      </span>
                      <input
                        name="task_title"
                        required={includeTask}
                        defaultValue={`Follow-up: ${selectedAction.label} mit ${contactName}`}
                        className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-neutral-700">
                        Faellig am
                      </span>
                      <input
                        type="date"
                        name="task_due_date"
                        required={includeTask}
                        defaultValue={defaultTaskDueDate()}
                        className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-neutral-700">
                        Task-Inhalt
                      </span>
                      <textarea
                        name="task_description"
                        rows={3}
                        placeholder="Was soll als naechstes passieren?"
                        className="mt-1 w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAction(null)}
                >
                  Abbrechen
                </Button>
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ActionIcon({
  icon,
}: {
  icon: "linkedin" | "phone" | "mail" | "meeting";
}) {
  if (icon === "linkedin") {
    return <MessageSquare aria-hidden="true" />;
  }

  if (icon === "phone") {
    return <Phone aria-hidden="true" />;
  }

  if (icon === "mail") {
    return <Mail aria-hidden="true" />;
  }

  return <CalendarDays aria-hidden="true" />;
}

function defaultDateTimeValue() {
  const date = new Date();
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function defaultTaskDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
