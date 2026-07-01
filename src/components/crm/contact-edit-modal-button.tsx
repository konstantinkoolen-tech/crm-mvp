"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { updateContact } from "@/app/(crm)/contacts/actions";
import { ContactForm } from "@/components/crm/contact-form";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/db/contacts";

type ContactEditModalButtonProps = {
  companyName?: string;
  contact: Contact;
  compact?: boolean;
};

export function ContactEditModalButton({
  companyName,
  contact,
  compact = true,
}: ContactEditModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contactName = `${contact.first_name} ${contact.last_name}`.trim();

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
          eyebrow="Kontakt"
          title={`${contactName} bearbeiten`}
          onClose={() => setIsOpen(false)}
        >
          <ContactForm
            action={updateContact}
            companyId={contact.company_id}
            companyName={companyName}
            contact={contact}
            onCancel={() => setIsOpen(false)}
            presentation="modal"
            submitLabel="Speichern"
          />
        </ModalShell>
      ) : null}
    </>
  );
}
