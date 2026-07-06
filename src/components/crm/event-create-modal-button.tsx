"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createEvent } from "@/app/(crm)/events/actions";
import { EventForm } from "@/components/crm/event-form";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import type { TeamProfile } from "@/lib/db/profiles";

type EventCreateModalButtonProps = {
  currentProfileId: string;
  label?: string;
  profiles: TeamProfile[];
};

export function EventCreateModalButton({
  currentProfileId,
  label = "Event",
  profiles,
}: EventCreateModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event"
          title="Event erstellen"
          onClose={() => setOpen(false)}
        >
          <EventForm
            action={createEvent}
            currentProfileId={currentProfileId}
            onCancel={() => setOpen(false)}
            presentation="modal"
            profiles={profiles}
            submitLabel="Event erstellen"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
