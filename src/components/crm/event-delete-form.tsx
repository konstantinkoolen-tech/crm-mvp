"use client";

import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/(crm)/events/actions";
import { Button } from "@/components/ui/button";

type EventDeleteFormProps = {
  eventId: string;
  compact?: boolean;
};

export function EventDeleteForm({ compact = false, eventId }: EventDeleteFormProps) {
  return (
    <form
      action={deleteEvent}
      onSubmit={(event) => {
        if (!window.confirm("Dieses Event wirklich löschen?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="event_id" value={eventId} />
      <Button
        type="submit"
        variant="ghost"
        size={compact ? "icon" : "default"}
        aria-label="Event löschen"
      >
        <Trash2 aria-hidden="true" />
        {compact ? null : "Löschen"}
      </Button>
    </form>
  );
}
