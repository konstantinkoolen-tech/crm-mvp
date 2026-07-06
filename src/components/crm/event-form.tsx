"use client";

import { CalendarPlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventWithDates } from "@/lib/db/events";
import type { TeamProfile } from "@/lib/db/profiles";
import { ownerDisplayName } from "@/lib/list-display";

type EventDateRow = {
  id?: string;
  localId: string;
  event_date: string;
  internal_owner_id: string;
};

type EventFormProps = {
  action: (formData: FormData) => Promise<void>;
  currentProfileId?: string;
  error?: string;
  event?: EventWithDates;
  onCancel?: () => void;
  presentation?: "page" | "modal";
  profiles: TeamProfile[];
  submitLabel: string;
};

export function EventForm({
  action,
  currentProfileId,
  error,
  event,
  onCancel,
  presentation = "page",
  profiles,
  submitLabel,
}: EventFormProps) {
  const isModal = presentation === "modal";
  const activeProfiles = useMemo(
    () => profiles.filter((profile) => profile.status === "active"),
    [profiles],
  );
  const [dates, setDates] = useState<EventDateRow[]>(() => {
    if (event?.dates.length) {
      return event.dates.map((date) => ({
        id: date.id,
        localId: date.id,
        event_date: date.event_date,
        internal_owner_id: date.internal_owner_id ?? "",
      }));
    }

    return [
      {
        localId: "new-0",
        event_date: "",
        internal_owner_id: currentProfileId ?? "",
      },
    ];
  });

  function addDate() {
    setDates((currentDates) => [
      ...currentDates,
      {
        localId: `new-${Date.now()}`,
        event_date: "",
        internal_owner_id: currentProfileId ?? "",
      },
    ]);
  }

  function removeDate(localId: string) {
    setDates((currentDates) =>
      currentDates.length > 1
        ? currentDates.filter((date) => date.localId !== localId)
        : currentDates,
    );
  }

  function updateDate(localId: string, patch: Partial<EventDateRow>) {
    setDates((currentDates) =>
      currentDates.map((date) =>
        date.localId === localId ? { ...date, ...patch } : date,
      ),
    );
  }

  return (
    <Card className={isModal ? "border-0 shadow-none" : undefined}>
      {!isModal ? (
        <CardHeader>
          <CardTitle>{event ? "Event bearbeiten" : "Event erstellen"}</CardTitle>
          <CardDescription>
            Pflege Event-Kontext, Termine und interne Zuordnung.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={isModal ? "p-0" : undefined}>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action={action} className="space-y-5">
          {event ? <input type="hidden" name="event_id" value={event.id} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event-name">Name</Label>
              <Input
                id="event-name"
                name="name"
                required
                defaultValue={event?.name ?? ""}
                placeholder="Zukunft Personal Europe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-website">Webseite</Label>
              <Input
                id="event-website"
                name="website"
                type="url"
                defaultValue={event?.website ?? ""}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location">Ort</Label>
              <Input
                id="event-location"
                name="location"
                defaultValue={event?.location ?? ""}
                placeholder="Köln Messe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-participant-count">Teilnehmerzahl</Label>
              <Input
                id="event-participant-count"
                name="participant_count"
                type="number"
                min="0"
                defaultValue={event?.participant_count ?? ""}
                placeholder="250"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-focus">Fokus</Label>
              <Input
                id="event-focus"
                name="focus"
                defaultValue={event?.focus ?? ""}
                placeholder="HR, Recruiting, Rec2Rec"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-price">Preis</Label>
              <Input
                id="event-price"
                name="price"
                defaultValue={event?.price ?? ""}
                placeholder="149 EUR"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-access">Zugang</Label>
              <Input
                id="event-access"
                name="access"
                defaultValue={event?.access ?? ""}
                placeholder="Ticket, Einladung, Gästeliste"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Label>Datum und interne Zuordnung</Label>
                  <p className="mt-1 text-xs text-neutral-500">
                    Mehrere Termine sind möglich.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDate}>
                  <Plus aria-hidden="true" />
                  Datum
                </Button>
              </div>

              <div className="space-y-2">
                {dates.map((date, index) => (
                  <div
                    className="grid gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]"
                    key={date.localId}
                  >
                    <input
                      type="hidden"
                      name="event_date_id[]"
                      value={date.id ?? ""}
                    />
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-neutral-500">
                        Datum {index + 1}
                      </span>
                      <Input
                        name="event_date[]"
                        type="date"
                        required={index === 0}
                        value={date.event_date}
                        onChange={(event) =>
                          updateDate(date.localId, {
                            event_date: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-neutral-500">
                        Interne Zuordnung
                      </span>
                      <select
                        name="event_date_owner_id[]"
                        value={date.internal_owner_id}
                        onChange={(event) =>
                          updateDate(date.localId, {
                            internal_owner_id: event.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                      >
                        <option value="">Nicht zugeordnet</option>
                        {activeProfiles.map((profile) => (
                          <option value={profile.id} key={profile.id}>
                            {ownerDisplayName(profile)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-end"
                      onClick={() => removeDate(date.localId)}
                      aria-label="Datum entfernen"
                      disabled={dates.length === 1}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="event-internal-notes">Interne Notiz</Label>
              <RichTextTextarea
                id="event-internal-notes"
                name="internal_notes"
                defaultValue={event?.internal_notes ?? ""}
                placeholder="Interne Einschätzung, Zielkontakte, Follow-up-Ideen"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {isModal ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
            ) : (
              <Link
                href={event ? `/events/${event.id}` : "/events"}
                className={buttonVariants({ variant: "outline" })}
              >
                Abbrechen
              </Link>
            )}
            <Button type="submit">
              <CalendarPlus aria-hidden="true" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
