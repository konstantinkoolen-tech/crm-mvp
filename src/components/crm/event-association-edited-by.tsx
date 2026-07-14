import type { EventAssociationWithContext } from "@/lib/db/events";
import { ownerDisplayName } from "@/lib/list-display";

type EventAssociationEditedByProps = {
  association: EventAssociationWithContext;
};

export function EventAssociationEditedBy({
  association,
}: EventAssociationEditedByProps) {
  if (!association.last_editor || !isEdited(association)) {
    return null;
  }

  return (
    <span className="mt-2 inline-flex max-w-full items-center rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 ring-1 ring-neutral-200">
      <span className="truncate">
        Bearbeitet von {ownerDisplayName(association.last_editor)}
      </span>
    </span>
  );
}

function isEdited(association: EventAssociationWithContext) {
  return (
    new Date(association.updated_at).getTime() >
    new Date(association.created_at).getTime() + 1000
  );
}
