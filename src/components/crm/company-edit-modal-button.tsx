"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { updateCompany } from "@/app/(crm)/companies/actions";
import { CompanyForm } from "@/components/crm/company-form";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/db/companies";
import type { TeamProfile } from "@/lib/db/profiles";

type CompanyEditModalButtonProps = {
  company: Company;
  compact?: boolean;
  profiles: TeamProfile[];
};

export function CompanyEditModalButton({
  company,
  compact = false,
  profiles,
}: CompanyEditModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Pencil aria-hidden="true" />
        Bearbeiten
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow="Unternehmen"
          title={`${company.name} bearbeiten`}
          onClose={() => setIsOpen(false)}
        >
          <CompanyForm
            action={updateCompany}
            company={company}
            onCancel={() => setIsOpen(false)}
            presentation="modal"
            profiles={profiles}
            submitLabel="Speichern"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
