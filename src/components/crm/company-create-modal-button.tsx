"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createCompany } from "@/app/(crm)/companies/actions";
import { CompanyForm } from "@/components/crm/company-form";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/crm/modal-shell";
import type { TeamProfile } from "@/lib/db/profiles";

type CompanyCreateModalButtonProps = {
  currentProfileId: string;
  label?: string;
  profiles: TeamProfile[];
};

export function CompanyCreateModalButton({
  currentProfileId,
  label = "Neu",
  profiles,
}: CompanyCreateModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Unternehmen"
          title="Unternehmen erstellen"
          onClose={() => setOpen(false)}
        >
          <CompanyForm
            action={createCompany}
            currentProfileId={currentProfileId}
            onCancel={() => setOpen(false)}
            presentation="modal"
            profiles={profiles}
            submitLabel="Unternehmen erstellen"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
