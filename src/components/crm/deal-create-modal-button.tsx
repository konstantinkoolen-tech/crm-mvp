"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createDeal } from "@/app/(crm)/deals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell } from "@/components/crm/modal-shell";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@/lib/db/companies";

const dealStages = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

const dealStageLabels: Record<(typeof dealStages)[number], string> = {
  lead: "Lead",
  qualified: "Qualifiziert",
  proposal: "Angebot",
  negotiation: "Verhandlung",
  won: "Gewonnen",
  lost: "Verloren",
};

type DealCreateModalButtonProps = {
  companies: Company[];
  label?: string;
};

export function DealCreateModalButton({
  companies,
  label = "Deal",
}: DealCreateModalButtonProps) {
  const [open, setOpen] = useState(false);
  const disabled = companies.length === 0;

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={disabled}>
        <Plus aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <ModalShell eyebrow="Deal" title="Deal erstellen" onClose={() => setOpen(false)}>
          {disabled ? (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              Lege zuerst ein Unternehmen an, bevor du Deals erstellst.
            </div>
          ) : (
            <form action={createDeal} className="space-y-5">
              <input type="hidden" name="return_to" value="/deals" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="global-deal-title">Titel</Label>
                  <Input
                    id="global-deal-title"
                    name="title"
                    required
                    placeholder="Enterprise Recruiting Retainer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-deal-company">Unternehmen</Label>
                  <select
                    id="global-deal-company"
                    name="company_id"
                    required
                    defaultValue=""
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                  >
                    <option value="" disabled>
                      Unternehmen auswaehlen
                    </option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-deal-stage">Pipeline-Stufe</Label>
                  <select
                    id="global-deal-stage"
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
                  <Label htmlFor="global-deal-value">Wert</Label>
                  <Input
                    id="global-deal-value"
                    name="value_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-deal-currency">Waehrung</Label>
                  <Input
                    id="global-deal-currency"
                    name="value_currency"
                    maxLength={3}
                    defaultValue="EUR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-deal-probability">Wahrscheinlichkeit</Label>
                  <Input
                    id="global-deal-probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-deal-close">Erwarteter Abschluss</Label>
                  <Input id="global-deal-close" name="expected_close_date" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="global-deal-description">Beschreibung</Label>
                  <Textarea
                    id="global-deal-description"
                    name="description"
                    placeholder="Kontext, Bedarf, naechster Schritt"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Deal erstellen</Button>
              </div>
            </form>
          )}
        </ModalShell>
      ) : null}
    </>
  );
}
