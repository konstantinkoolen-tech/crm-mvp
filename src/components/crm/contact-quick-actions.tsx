"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Flame,
  FlameKindling,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Snowflake,
  X,
} from "lucide-react";
import { createActivity } from "@/app/(crm)/activities/actions";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { TaskOwnerSelect } from "@/components/crm/task-owner-select";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/db/contacts";
import type { TeamProfile } from "@/lib/db/profiles";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  truncateTaskTitle,
} from "@/lib/tasks/limits";
import type { ValueProp } from "@/lib/db/value-props";
import type {
  ActivityDirection,
  ActivityType,
  OutreachKind,
  OutreachOutcome,
} from "@/types/database";

type ContactQuickActionsProps = {
  contact: Contact;
  companyId: string;
  contactName: string;
  currentProfileId: string;
  dealId?: string;
  returnTo?: string;
  teamProfiles: TeamProfile[];
  valueProps: ValueProp[];
  expanded?: boolean;
  onActivitySubmit?: (activity: PendingActivity) => void;
};

export type PendingActivity = {
  id: string;
  body: string | null;
  title: string;
  type: ActivityType;
  occurredAt: string;
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

const outreachOptions: {
  kind: OutreachKind;
  label: string;
  icon: typeof Snowflake;
  className: string;
}[] = [
  {
    kind: "snowflake",
    label: "Snowflake",
    icon: Snowflake,
    className:
      "data-[selected=true]:border-sky-300 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700",
  },
  {
    kind: "fire",
    label: "Fire",
    icon: Flame,
    className:
      "data-[selected=true]:border-orange-300 data-[selected=true]:bg-orange-50 data-[selected=true]:text-orange-700",
  },
  {
    kind: "fire_plus",
    label: "Fire+",
    icon: FlameKindling,
    className:
      "data-[selected=true]:border-red-300 data-[selected=true]:bg-red-50 data-[selected=true]:text-red-700",
  },
];

const snowflakeOutcomes: { value: OutreachOutcome; label: string }[] = [
  { value: "no_response", label: "No response" },
  { value: "wrong_number", label: "Falsche Nummer" },
  { value: "gatekeeper", label: "Gatekeeper" },
  { value: "no_time", label: "Keine Zeit" },
  { value: "not_interested", label: "Kein Interesse" },
  { value: "interested", label: "Interesse" },
  { value: "follow_up_booked", label: "Follow-up gebucht" },
];

const warmOutcomes: { value: OutreachOutcome; label: string }[] = [
  { value: "no_response", label: "No response" },
  { value: "no_time", label: "Keine Zeit" },
  { value: "not_interested", label: "Kein Interesse" },
  { value: "interested", label: "Interesse" },
  { value: "follow_up_booked", label: "Follow-up gebucht" },
];

export function ContactQuickActions({
  contact,
  companyId,
  contactName,
  currentProfileId,
  dealId,
  returnTo,
  teamProfiles,
  valueProps,
  expanded = false,
  onActivitySubmit,
}: ContactQuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(
    null,
  );
  const [dateTime, setDateTime] = useState(() => defaultDateTimeValue());
  const [includeTask, setIncludeTask] = useState(false);
  const [outreachKind, setOutreachKind] = useState<OutreachKind | null>(null);
  const [direction, setDirection] = useState<ActivityDirection>("outbound");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const occurredAt = useMemo(() => {
    const parsed = new Date(dateTime);
    return Number.isNaN(parsed.getTime())
      ? new Date().toISOString()
      : parsed.toISOString();
  }, [dateTime]);
  const capturesImmediateResponse =
    (direction === "outbound" &&
      outreachKind !== null &&
      (selectedAction?.type === "call" ||
        selectedAction?.type === "meeting")) ||
    direction === "inbound";
  const requiresOutcome =
    direction === "outbound" &&
    outreachKind !== null &&
    (selectedAction?.type === "call" || selectedAction?.type === "meeting");
  const requiresValueProp = direction === "outbound" && outreachKind !== null;

  return (
    <>
      <div
        className={expanded ? "flex flex-wrap gap-2" : "flex flex-nowrap gap-1"}
      >
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
            title={`${action.label} hinzufügen`}
            aria-label={`${action.label} hinzufügen`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedAction(action);
              setIncludeTask(false);
              setOutreachKind(null);
              setDirection("outbound");
              setIsSubmitting(false);
            }}
          >
            <ActionIcon icon={action.icon} />
            <span className={expanded ? "inline" : "sr-only"}>
              {action.label}
            </span>
          </Button>
        ))}
      </div>

      {selectedAction
        ? createPortal(
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/35 px-4 py-6 sm:py-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="activity-dialog-title"
              onKeyDown={(event) => event.stopPropagation()}
              onKeyUp={(event) => event.stopPropagation()}
              onClick={() => setSelectedAction(null)}
            >
              <div
                className="mx-auto w-full max-w-md rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Aktivität
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
                    aria-label="Dialog schließen"
                    onClick={() => setSelectedAction(null)}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>

                <form
                  action={createActivity}
                  className="mt-5 space-y-4"
                  onSubmit={(event) => {
                    if (isSubmitting || !selectedAction) {
                      event.preventDefault();
                      return;
                    }

                    const formData = new FormData(event.currentTarget);
                    const title = `${selectedAction.label} mit ${contactName}`;

                    onActivitySubmit?.({
                      id: crypto.randomUUID(),
                      body: textOrNull(formData.get("body")),
                      title,
                      type: selectedAction.type,
                      occurredAt,
                    });
                    setIsSubmitting(true);
                    setSelectedAction(null);
                  }}
                >
                  <input type="hidden" name="company_id" value={companyId} />
                  <input type="hidden" name="contact_id" value={contact.id} />
                  {dealId ? (
                    <input type="hidden" name="deal_id" value={dealId} />
                  ) : null}
                  <input
                    type="hidden"
                    name="type"
                    value={selectedAction.type}
                  />
                  <input type="hidden" name="direction" value={direction} />
                  <input
                    type="hidden"
                    name="title"
                    value={`${selectedAction.label} mit ${contactName}`}
                  />
                  <input type="hidden" name="occurred_at" value={occurredAt} />
                  {includeTask ? (
                    <input type="hidden" name="create_task" value="true" />
                  ) : null}
                  {direction === "outbound" && outreachKind ? (
                    <input
                      type="hidden"
                      name="outreach_kind"
                      value={outreachKind}
                    />
                  ) : null}
                  <input
                    type="hidden"
                    name="return_to"
                    value={returnTo ?? `/companies/${companyId}`}
                  />

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

                  <div className="block">
                    <label
                      htmlFor={`quick-activity-body-${contact.id}`}
                      className="text-sm font-medium text-neutral-700"
                    >
                      Inhalt der Aktivität
                    </label>
                    <RichTextTextarea
                      id={`quick-activity-body-${contact.id}`}
                      name="body"
                      rows={5}
                      required
                      placeholder="Kurze Zusammenfassung, Ergebnis oder nächster Schritt..."
                      wrapperClassName="mt-1"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      Richtung
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <DirectionButton
                        active={direction === "outbound"}
                        icon={<ArrowUpRight aria-hidden="true" />}
                        label="Ausgehend"
                        description="Von uns an Kontakt"
                        onClick={() => setDirection("outbound")}
                      />
                      <DirectionButton
                        active={direction === "inbound"}
                        icon={<ArrowDownLeft aria-hidden="true" />}
                        label="Eingehend"
                        description="Kontakt an uns"
                        onClick={() => {
                          setDirection("inbound");
                          setOutreachKind(null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                    {direction === "outbound" ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-neutral-800">
                            Outreach-Art
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            Optional für ausgehende Aktivitäten.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {outreachOptions.map((option) => {
                            const Icon = option.icon;
                            const selected = outreachKind === option.kind;

                            return (
                              <Button
                                key={option.kind}
                                type="button"
                                variant="outline"
                                size="icon"
                                data-selected={selected}
                                className={option.className}
                                title={option.label}
                                aria-label={`${option.label} Outreach markieren`}
                                onClick={() =>
                                  setOutreachKind((current) =>
                                    current === option.kind
                                      ? null
                                      : option.kind,
                                  )
                                }
                              >
                                <Icon aria-hidden="true" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {direction === "inbound" || outreachKind ? (
                      <div
                        className={
                          direction === "outbound"
                            ? "mt-4 grid gap-3"
                            : "grid gap-3"
                        }
                      >
                        {capturesImmediateResponse ? (
                          <>
                            <label className="block">
                              <span className="text-sm font-medium text-neutral-700">
                                Outcome
                              </span>
                              <select
                                name="outreach_outcome"
                                required={requiresOutcome}
                                defaultValue=""
                                className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                              >
                                <option value="" disabled={requiresOutcome}>
                                  {requiresOutcome
                                    ? "Outcome auswählen"
                                    : "Kein Outcome"}
                                </option>
                                {(direction === "outbound" &&
                                outreachKind === "snowflake"
                                  ? snowflakeOutcomes
                                  : warmOutcomes
                                ).map((outcome) => (
                                  <option
                                    key={outcome.value}
                                    value={outcome.value}
                                  >
                                    {outcome.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="block">
                              <span className="text-sm font-medium text-neutral-700">
                                Pain Aussage
                              </span>
                              <select
                                name="pain_statement"
                                defaultValue="no_statement"
                                required
                                className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                              >
                                <option value="no_statement">
                                  Keine Aussage
                                </option>
                                <option value="pain_not_identified">
                                  Pain nicht erkannt
                                </option>
                                <option value="pain_identified">
                                  Pain erkannt
                                </option>
                              </select>
                            </label>
                          </>
                        ) : (
                          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-500">
                            Outcome und Pain werden erst bei Calls, Meetings
                            oder eingehenden Rückmeldungen erfasst.
                          </div>
                        )}

                        <label className="block">
                          <span className="text-sm font-medium text-neutral-700">
                            Value Prop
                          </span>
                          <select
                            name="value_prop_id"
                            defaultValue=""
                            required={requiresValueProp}
                            className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                          >
                            <option value="" disabled={requiresValueProp}>
                              {requiresValueProp
                                ? "Value Prop auswählen"
                                : "Keine Value Prop"}
                            </option>
                            {valueProps.map((valueProp) => (
                              <option key={valueProp.id} value={valueProp.id}>
                                {valueProp.code}: {valueProp.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant={includeTask ? "default" : "outline"}
                      size="sm"
                      className="h-9 rounded-full px-3"
                      aria-label={
                        includeTask
                          ? "Task-Erstellung entfernen"
                          : "Task erstellen"
                      }
                      title={
                        includeTask
                          ? "Task-Erstellung entfernen"
                          : "Task erstellen"
                      }
                      onClick={() => setIncludeTask((value) => !value)}
                    >
                      <Plus
                        className={
                          includeTask ? "rotate-45 transition" : "transition"
                        }
                        aria-hidden="true"
                      />
                      Task
                    </Button>
                  </div>

                  {includeTask ? (
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-neutral-950">
                          Follow-up Task
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          Wird zusammen mit der Aktivität gespeichert.
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
                            defaultValue={truncateTaskTitle(
                              `Follow-up: ${selectedAction.label} mit ${contactName}`,
                            )}
                            maxLength={TASK_TITLE_MAX_LENGTH}
                            className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                          />
                        </label>

                        <label className="block">
                          <span className="text-sm font-medium text-neutral-700">
                            Fällig am
                          </span>
                          <input
                            type="date"
                            name="task_due_date"
                            required={includeTask}
                            defaultValue={defaultTaskDueDate()}
                            className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                          />
                        </label>

                        <TaskOwnerSelect
                          id={`task-owner-${contact.id}`}
                          name="task_owner_id"
                          defaultOwnerId={currentProfileId}
                          profiles={teamProfiles}
                        />

                        <div className="block">
                          <label
                            htmlFor={`quick-task-description-${contact.id}`}
                            className="text-sm font-medium text-neutral-700"
                          >
                            Task-Inhalt
                          </label>
                          <RichTextTextarea
                            id={`quick-task-description-${contact.id}`}
                            name="task_description"
                            rows={3}
                            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                            placeholder="Was soll als nächstes passieren?"
                            wrapperClassName="mt-1"
                          />
                        </div>
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
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Speichert..." : "Speichern"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
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

function DirectionButton({
  active,
  description,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-md border border-neutral-950 bg-neutral-950 px-3 py-2 text-left text-white"
          : "rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
      }
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="[&_svg]:size-4">{icon}</span>
        {label}
      </span>
      <span
        className={
          active
            ? "mt-1 block text-xs text-neutral-300"
            : "mt-1 block text-xs text-neutral-500"
        }
      >
        {description}
      </span>
    </button>
  );
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

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}
