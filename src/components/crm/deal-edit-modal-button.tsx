"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { updateDeal } from "@/app/(crm)/deals/actions";
import { DealForm } from "@/components/crm/deal-form";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/db/companies";
import type { Deal } from "@/lib/db/deals";

type DealEditModalButtonProps = {
  companies: Company[];
  compact?: boolean;
  deal: Deal;
};

export function DealEditModalButton({
  companies,
  compact = true,
  deal,
}: DealEditModalButtonProps) {
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
          eyebrow="Deal"
          title={`${deal.title} bearbeiten`}
          onClose={() => setIsOpen(false)}
        >
          <DealForm
            action={updateDeal}
            companies={companies}
            deal={deal}
            onCancel={() => setIsOpen(false)}
            presentation="modal"
            submitLabel="Speichern"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
