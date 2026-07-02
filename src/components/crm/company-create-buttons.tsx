"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createContact } from "@/app/(crm)/contacts/actions";
import { createDeal } from "@/app/(crm)/deals/actions";
import { DealValuePeriodToggle } from "@/components/crm/deal-value-period-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell } from "@/components/crm/modal-shell";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import {
  dealStageLabels,
  dealStages,
  dealStatusLabels,
  dealStatuses,
} from "@/lib/deals/constants";

type CompanyCreateButtonsProps = {
  companyId: string;
  companyName?: string;
};

export function ContactCreateButton({
  companyId,
  companyName,
}: CompanyCreateButtonsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Kontakt
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Kontakt"
          title={`Kontakt für ${companyName ?? "Unternehmen"} erstellen`}
          onClose={() => setOpen(false)}
        >
          <form action={createContact} className="space-y-5">
            <input type="hidden" name="company_id" value={companyId} />
            <ContactFields />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Kontakt erstellen</Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function DealCreateButton({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Deal
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Deal"
          title="Deal erstellen"
          onClose={() => setOpen(false)}
        >
          <form action={createDeal} className="space-y-5">
            <input type="hidden" name="company_id" value={companyId} />
            <input
              type="hidden"
              name="return_to"
              value={`/companies/${companyId}`}
            />
            <DealFields />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Deal erstellen</Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

function ContactFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="modal-first-name">Vorname</Label>
        <Input
          id="modal-first-name"
          name="first_name"
          required
          placeholder="Mara"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-last-name">Nachname</Label>
        <Input
          id="modal-last-name"
          name="last_name"
          required
          placeholder="Schmidt"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-email">E-Mail</Label>
        <Input
          id="modal-email"
          name="email"
          type="email"
          placeholder="mara@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-phone">Telefon</Label>
        <Input id="modal-phone" name="phone" type="tel" placeholder="+49 ..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-job-title">Position</Label>
        <Input
          id="modal-job-title"
          name="job_title"
          placeholder="Head of People"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-linkedin">LinkedIn</Label>
        <Input
          id="modal-linkedin"
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-contact-status">Status</Label>
        <select
          id="modal-contact-status"
          name="status"
          defaultValue="active"
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
        >
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
          <option value="archived">Archiviert</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="modal-contact-notes">Notizen</Label>
        <RichTextTextarea
          id="modal-contact-notes"
          name="notes"
          placeholder="Rolle im Buying Committee, Kontext, nächster Schritt"
        />
      </div>
    </div>
  );
}

function DealFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="modal-deal-title">Titel</Label>
        <Input
          id="modal-deal-title"
          name="title"
          required
          placeholder="Enterprise Recruiting Retainer"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-deal-stage">Pipeline-Stufe</Label>
        <select
          id="modal-deal-stage"
          name="stage"
          defaultValue="lead"
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
        >
          {dealStages.map((stage) => (
            <option key={stage} value={stage}>
              {dealStageLabels[stage]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-deal-status">Status</Label>
        <select
          id="modal-deal-status"
          name="status"
          defaultValue="open"
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
        >
          {dealStatuses.map((status) => (
            <option key={status} value={status}>
              {dealStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-deal-value">Wert</Label>
        <Input
          id="modal-deal-value"
          name="value_amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="25000"
        />
      </div>
      <DealValuePeriodToggle idPrefix="modal-deal-value-period" />
      <div className="space-y-2">
        <Label htmlFor="modal-deal-currency">Währung</Label>
        <Input
          id="modal-deal-currency"
          name="value_currency"
          maxLength={3}
          defaultValue="EUR"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-deal-probability">Wahrscheinlichkeit</Label>
        <Input
          id="modal-deal-probability"
          name="probability"
          type="number"
          min="0"
          max="100"
          placeholder="40"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="modal-deal-close">Erwarteter Abschluss</Label>
        <Input id="modal-deal-close" name="expected_close_date" type="date" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="modal-deal-description">Beschreibung</Label>
        <RichTextTextarea
          id="modal-deal-description"
          name="description"
          placeholder="Kontext, Bedarf, nächster Schritt"
        />
      </div>
    </div>
  );
}
