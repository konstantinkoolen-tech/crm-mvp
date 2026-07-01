"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteActivity } from "@/app/(crm)/activities/actions";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";

type ActivityDeleteButtonProps = {
  activityId: string;
  returnTo: string;
  companyId?: string | null;
  dealId?: string | null;
};

export function ActivityDeleteButton({
  activityId,
  returnTo,
  companyId,
  dealId,
}: ActivityDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-neutral-500 hover:bg-red-50 hover:text-red-700"
        aria-label="Aktivität löschen"
        title="Aktivität löschen"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 aria-hidden="true" />
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="Aktivität"
          title="Aktivität löschen?"
          onClose={() => setIsOpen(false)}
        >
          <p className="text-sm text-neutral-700">
            Willst du die Aktivität wirklich löschen?
          </p>
          <form action={deleteActivity} className="mt-6 flex justify-end gap-2">
            <input type="hidden" name="activity_id" value={activityId} />
            {companyId ? (
              <input type="hidden" name="company_id" value={companyId} />
            ) : null}
            {dealId ? <input type="hidden" name="deal_id" value={dealId} /> : null}
            <input type="hidden" name="return_to" value={returnTo} />
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" variant="destructive">
              Jetzt Löschen
            </Button>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}
