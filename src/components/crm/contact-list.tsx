"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ContactDeleteForm } from "@/components/crm/contact-delete-form";
import { ContactEditModalButton } from "@/components/crm/contact-edit-modal-button";
import { ContactStatusBadge } from "@/components/crm/contact-status-badge";
import { ListFilterBar } from "@/components/crm/list-filter-bar";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContactWithCompany } from "@/lib/db/contacts";
import { formatEventDate } from "@/lib/events/format";
import { ownerDisplayName } from "@/lib/list-display";

type ContactSort = "updated_desc" | "name_asc" | "company_asc" | "created_desc";

const contactStatusLabels = {
  active: "Aktiv",
  inactive: "Inaktiv",
  archived: "Archiviert",
};

export function ContactList({ contacts }: { contacts: ContactWithCompany[] }) {
  const [sort, setSort] = useState<ContactSort>("updated_desc");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>();
    for (const contact of contacts) {
      if (contact.owner) {
        owners.set(contact.owner.id, ownerDisplayName(contact.owner));
      }
    }
    return Array.from(owners, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [contacts]);

  const visibleContacts = useMemo(() => {
    return [...contacts]
      .filter((contact) => owner === "all" || contact.owner_id === owner)
      .filter((contact) => status === "all" || contact.status === status)
      .sort((a, b) => {
        if (sort === "name_asc") {
          return contactName(a).localeCompare(contactName(b));
        }
        if (sort === "company_asc") {
          return (a.company?.name ?? "").localeCompare(b.company?.name ?? "");
        }
        if (sort === "created_desc") {
          return dateValue(b.created_at) - dateValue(a.created_at);
        }
        return dateValue(b.updated_at) - dateValue(a.updated_at);
      });
  }, [contacts, owner, sort, status]);

  if (contacts.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-neutral-100 p-3">
            <Users className="size-6 text-neutral-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Noch keine Kontakte
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Kontakte werden über ein Unternehmensprofil erstellt.
          </p>
          <Link href="/companies" className={buttonVariants({ className: "mt-5" })}>
            Zu Unternehmen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Kontakte</CardTitle>
        <CardDescription>
          {visibleContacts.length} von {contacts.length} Einträgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ListFilterBar
          sortValue={sort}
          sortOptions={[
            { value: "updated_desc", label: "Zuletzt aktualisiert" },
            { value: "name_asc", label: "Name A-Z" },
            { value: "company_asc", label: "Unternehmen A-Z" },
            { value: "created_desc", label: "Erstellt zuletzt" },
          ]}
          onSortChange={(value) => setSort(value as ContactSort)}
          ownerValue={owner}
          ownerOptions={ownerOptions}
          onOwnerChange={setOwner}
          statusValue={status}
          statusOptions={Object.entries(contactStatusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onStatusChange={setStatus}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unternehmen</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Zuständig</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="font-medium text-neutral-950">
                    {contactName(contact)}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {contact.email ?? contact.phone ?? "Keine Kontaktdaten"}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.company ? (
                    <Link
                      href={`/companies/${contact.company.id}`}
                      className="hover:underline"
                    >
                      {contact.company.name}
                    </Link>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{contact.job_title ?? "-"}</TableCell>
                <TableCell>
                  <ContactEventSummary contact={contact} />
                </TableCell>
                <TableCell>{ownerDisplayName(contact.owner)}</TableCell>
                <TableCell>
                  <ContactStatusBadge status={contact.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ContactEditModalButton
                      companyName={contact.company?.name ?? undefined}
                      contact={contact}
                    />
                    <ContactDeleteForm
                      contactId={contact.id}
                      companyId={contact.company_id}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function contactName(contact: Pick<ContactWithCompany, "first_name" | "last_name">) {
  return `${contact.first_name} ${contact.last_name}`.trim();
}

function ContactEventSummary({ contact }: { contact: ContactWithCompany }) {
  if (!contact.event_associations?.length) {
    return <span className="text-neutral-500">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {contact.event_associations.slice(0, 2).map((association) => (
        <Link
          href={`/events/${association.event_id}`}
          className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200 hover:text-neutral-950 hover:underline"
          key={association.id}
        >
          {association.event?.name ?? "Event"}
          {association.event_date
            ? ` · ${formatEventDate(association.event_date.event_date)}`
            : ""}
        </Link>
      ))}
      {contact.event_associations.length > 2 ? (
        <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500 ring-1 ring-neutral-200">
          +{contact.event_associations.length - 2}
        </span>
      ) : null}
    </div>
  );
}

function dateValue(value: string) {
  return new Date(value).getTime();
}
