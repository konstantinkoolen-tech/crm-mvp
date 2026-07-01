"use client";

import { useState } from "react";
import { ContactQuickActions } from "@/components/crm/contact-quick-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Contact } from "@/lib/db/contacts";
import type { TeamProfile } from "@/lib/db/profiles";
import type { ValueProp } from "@/lib/db/value-props";

type DealActivityActionsProps = {
  companyId: string;
  currentProfileId: string;
  dealId: string;
  contacts: Contact[];
  defaultContactId?: string | null;
  teamProfiles: TeamProfile[];
  valueProps: ValueProp[];
  error?: string;
};

export function DealActivityActions({
  companyId,
  currentProfileId,
  dealId,
  contacts,
  defaultContactId,
  teamProfiles,
  valueProps,
  error,
}: DealActivityActionsProps) {
  const initialContactId =
    contacts.find((contact) => contact.id === defaultContactId)?.id ??
    contacts[0]?.id ??
    "";
  const [contactId, setContactId] = useState(initialContactId);
  const selectedContact =
    contacts.find((contact) => contact.id === contactId) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivität erfassen</CardTitle>
        <CardDescription>
          Mitarbeiter auswählen und Aktivität wie auf Unternehmensebene dokumentieren.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {contacts.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Mitarbeiter vorhanden
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Lege zuerst auf der Unternehmensseite einen Kontakt an.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="deal-activity-contact">Mitarbeiter</Label>
              <select
                id="deal-activity-contact"
                value={contactId}
                onChange={(event) => setContactId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                    {contact.job_title ? ` · ${contact.job_title}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700">Aktivität</p>
              {selectedContact ? (
                <ContactQuickActions
                  contact={selectedContact}
                  companyId={companyId}
                  contactName={`${selectedContact.first_name} ${selectedContact.last_name}`}
                  currentProfileId={currentProfileId}
                  dealId={dealId}
                  returnTo={`/deals/${dealId}`}
                  teamProfiles={teamProfiles}
                  valueProps={valueProps}
                  expanded
                />
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
