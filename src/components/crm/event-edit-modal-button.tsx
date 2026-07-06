"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { updateEvent } from "@/app/(crm)/events/actions";
import { EventForm } from "@/components/crm/event-form";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import type { EventWithDates } from "@/lib/db/events";
import type { TeamProfile } from "@/lib/db/profiles";

type EventEditModalButtonProps = {
  event: EventWithDates;
  profiles: TeamProfile[];
};

export function EventEditModalButton({
  event,
  profiles,
}: EventEditModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Pencil aria-hidden="true" />
        Bearbeiten
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event"
          title={`${event.name} bearbeiten`}
          onClose={() => setOpen(false)}
        >
          <EventForm
            action={updateEvent}
            event={event}
            onCancel={() => setOpen(false)}
            presentation="modal"
            profiles={profiles}
            submitLabel="Speichern"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
