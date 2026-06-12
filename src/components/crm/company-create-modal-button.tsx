"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createCompany } from "@/app/(crm)/companies/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell } from "@/components/crm/modal-shell";
import { Textarea } from "@/components/ui/textarea";

type CompanyCreateModalButtonProps = {
  label?: string;
};

export function CompanyCreateModalButton({
  label = "Neu",
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
          <form action={createCompany} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="modal-company-name">Name</Label>
                <Input
                  id="modal-company-name"
                  name="name"
                  required
                  placeholder="Acme GmbH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-company-website">Website</Label>
                <Input
                  id="modal-company-website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-company-industry">Branche</Label>
                <Input id="modal-company-industry" name="industry" placeholder="SaaS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-company-employees">Mitarbeiter</Label>
                <Input
                  id="modal-company-employees"
                  name="employee_count"
                  type="number"
                  min="0"
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-company-status">Status</Label>
                <select
                  id="modal-company-status"
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
                <Label htmlFor="modal-company-notes">Notizen</Label>
                <Textarea
                  id="modal-company-notes"
                  name="notes"
                  placeholder="Kurze Account-Notiz"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">Unternehmen erstellen</Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}
