"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteTeamUser } from "@/app/(crm)/settings/actions";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";

type UserDeleteButtonProps = {
  profileId: string;
  userName: string;
};

export function UserDeleteButton({ profileId, userName }: UserDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 text-neutral-500 hover:bg-red-50 hover:text-red-700"
        aria-label={`${userName} löschen`}
        title="User löschen"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 aria-hidden="true" />
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="User Verwaltung"
          title="User wirklich löschen?"
          onClose={() => setIsOpen(false)}
        >
          <p className="text-sm leading-6 text-neutral-700">
            Möchtest du <strong>{userName}</strong> wirklich löschen? Der Zugang wird
            dauerhaft entfernt. Vorhandene CRM-Daten werden deinem Admin-Account
            zugeordnet.
          </p>
          <form action={deleteTeamUser} className="mt-6 flex justify-end gap-2">
            <input type="hidden" name="profile_id" value={profileId} />
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
