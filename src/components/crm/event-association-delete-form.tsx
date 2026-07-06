"use client";

import { Trash2 } from "lucide-react";
import { deleteEventAssociation } from "@/app/(crm)/events/actions";
import { Button } from "@/components/ui/button";

type EventAssociationDeleteFormProps = {
  associationId: string;
  companyId?: string | null;
  eventId: string;
  returnTo: string;
};

export function EventAssociationDeleteForm({
  associationId,
  companyId,
  eventId,
  returnTo,
}: EventAssociationDeleteFormProps) {
  return (
    <form action={deleteEventAssociation}>
      <input type="hidden" name="association_id" value={associationId} />
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="company_id" value={companyId ?? ""} />
      <input type="hidden" name="return_to" value={returnTo} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Event-Zuordnung entfernen"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </form>
  );
}
