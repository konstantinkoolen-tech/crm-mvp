"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  FlameKindling,
  Pencil,
  Snowflake,
} from "lucide-react";
import { updateActivity } from "@/app/(crm)/activities/actions";
import { ModalShell } from "@/components/crm/modal-shell";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activityTypeLabels } from "@/lib/activities/constants";
import type { ActivityWithContext } from "@/lib/db/activities";
import type { ValueProp } from "@/lib/db/value-props";
import type {
  ActivityDirection,
  ActivityStatus,
  ActivityType,
  OutreachKind,
  OutreachOutcome,
} from "@/types/database";

type ActivityEditModalButtonProps = {
  activity: ActivityWithContext;
  returnTo: string;
  valueProps: ValueProp[];
};

const activityTypes: ActivityType[] = [
  "note",
  "linkedin_message",
  "call",
  "email",
  "meeting",
  "task_update",
];

const activityStatuses: { value: ActivityStatus; label: string }[] = [
  { value: "planned", label: "Geplant" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "canceled", label: "Abgebrochen" },
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

export function ActivityEditModalButton({
  activity,
  returnTo,
  valueProps,
}: ActivityEditModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<ActivityType>(activity.type);
  const [direction, setDirection] = useState<ActivityDirection>(
    activity.direction,
  );
  const [outreachKind, setOutreachKind] = useState<OutreachKind | null>(
    activity.outreach_kind,
  );
  const [occurredAt, setOccurredAt] = useState(() =>
    toDateTimeLocalValue(activity.occurred_at),
  );
  const valuePropOptions = useMemo(() => {
    if (
      !activity.value_prop ||
      valueProps.some((valueProp) => valueProp.id === activity.value_prop?.id)
    ) {
      return valueProps;
    }

    return [
      ...valueProps,
      {
        id: activity.value_prop.id,
        owner_id: activity.owner_id,
        code: activity.value_prop.code,
        label: activity.value_prop.label,
        description: null,
        status: "active" as const,
        sort_order: 999,
        created_at: activity.created_at,
        updated_at: activity.updated_at,
      },
    ];
  }, [activity, valueProps]);
  const requiresOutcome =
    direction === "outbound" &&
    outreachKind !== null &&
    (type === "call" || type === "meeting");
  const capturesInsights = direction === "inbound" || requiresOutcome;
  const needsValueProp = direction === "inbound" || outreachKind !== null;
  const requiresValueProp = direction === "outbound" && outreachKind !== null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
        aria-label="Aktivität bearbeiten"
        title="Aktivität bearbeiten"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setType(activity.type);
          setDirection(activity.direction);
          setOutreachKind(activity.outreach_kind);
          setOccurredAt(toDateTimeLocalValue(activity.occurred_at));
          setIsOpen(true);
        }}
      >
        <Pencil aria-hidden="true" />
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="Aktivität"
          title="Aktivität bearbeiten"
          onClose={() => setIsOpen(false)}
        >
          <form action={updateActivity} className="space-y-5">
            <input type="hidden" name="activity_id" value={activity.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <input
              type="hidden"
              name="occurred_at"
              value={dateTimeLocalToIso(occurredAt)}
            />
            {direction === "outbound" && outreachKind ? (
              <input type="hidden" name="outreach_kind" value={outreachKind} />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`activity-type-${activity.id}`}>Typ</Label>
                <select
                  id={`activity-type-${activity.id}`}
                  name="type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as ActivityType)
                  }
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {activityTypes.map((activityType) => (
                    <option key={activityType} value={activityType}>
                      {activityTypeLabels[activityType]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`activity-status-${activity.id}`}>Status</Label>
                <select
                  id={`activity-status-${activity.id}`}
                  name="status"
                  defaultValue={activity.status}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {activityStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`activity-occurred-at-${activity.id}`}>
                  Datum und Uhrzeit
                </Label>
                <Input
                  id={`activity-occurred-at-${activity.id}`}
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(event) => setOccurredAt(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`activity-title-${activity.id}`}>Titel</Label>
              <Input
                id={`activity-title-${activity.id}`}
                name="title"
                defaultValue={activity.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`activity-body-${activity.id}`}>Inhalt</Label>
              <RichTextTextarea
                id={`activity-body-${activity.id}`}
                name="body"
                rows={6}
                defaultValue={activity.body ?? ""}
                placeholder="Kurze Zusammenfassung, Ergebnis oder nächster Schritt..."
              />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-700">Richtung</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
              <input type="hidden" name="direction" value={direction} />
            </div>

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
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
                              current === option.kind ? null : option.kind,
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

              {needsValueProp ? (
                <div
                  className={
                    direction === "outbound" ? "mt-4 grid gap-3" : "grid gap-3"
                  }
                >
                  {capturesInsights ? (
                    <>
                      <label className="block">
                        <span className="text-sm font-medium text-neutral-700">
                          Outcome
                        </span>
                        <select
                          name="outreach_outcome"
                          required={requiresOutcome}
                          defaultValue={activity.outreach_outcome ?? ""}
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
                            <option key={outcome.value} value={outcome.value}>
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
                          defaultValue={activity.pain_statement}
                          required
                          className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                        >
                          <option value="no_statement">Keine Aussage</option>
                          <option value="pain_not_identified">
                            Pain nicht erkannt
                          </option>
                          <option value="pain_identified">Pain erkannt</option>
                        </select>
                      </label>
                    </>
                  ) : (
                    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-500">
                      Outcome und Pain werden erst bei Calls, Meetings oder
                      eingehenden Rückmeldungen erfasst.
                    </div>
                  )}

                  <label className="block">
                    <span className="text-sm font-medium text-neutral-700">
                      Value Prop
                    </span>
                    <select
                      name="value_prop_id"
                      defaultValue={activity.value_prop_id ?? ""}
                      required={requiresValueProp}
                      className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                    >
                      <option value="" disabled={requiresValueProp}>
                        {requiresValueProp
                          ? "Value Prop auswählen"
                          : "Keine Value Prop"}
                      </option>
                      {valuePropOptions.map((valueProp) => (
                        <option key={valueProp.id} value={valueProp.id}>
                          {valueProp.code}: {valueProp.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-500">
                  Outreach-Details sind optional. Wähle eine Outreach-Art oder
                  Eingehend, um Outcome, Pain und Value Prop zu erfassen.
                </div>
              )}
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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateTimeLocalToIso(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}
