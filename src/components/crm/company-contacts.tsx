import { Mail, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { ContactDeleteForm } from "@/components/crm/contact-delete-form";
import { ContactStatusBadge } from "@/components/crm/contact-status-badge";
import { buttonVariants } from "@/components/ui/button";
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
import type { Contact } from "@/lib/db/contacts";

type CompanyContactsProps = {
  companyId: string;
  contacts: Contact[];
};

export function CompanyContacts({ companyId, contacts }: CompanyContactsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Kontakte</CardTitle>
          <CardDescription>
            Ansprechpartner, die diesem Unternehmen zugeordnet sind.
          </CardDescription>
        </div>
        <Link
          href={`/companies/${companyId}/contacts/new`}
          className={buttonVariants({ size: "sm" })}
        >
          <Plus aria-hidden="true" />
          Kontakt
        </Link>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Kontakte
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Fuege die ersten Ansprechpartner fuer dieses Unternehmen hinzu.
            </p>
            <Link
              href={`/companies/${companyId}/contacts/new`}
              className={buttonVariants({ className: "mt-4", size: "sm" })}
            >
              <Plus aria-hidden="true" />
              Kontakt erstellen
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="font-medium text-neutral-950">
                      {contact.first_name} {contact.last_name}
                    </div>
                    {contact.linkedin_url ? (
                      <Link
                        href={contact.linkedin_url}
                        className="mt-1 block text-xs text-neutral-500 hover:text-neutral-950 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell>{contact.job_title ?? "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm text-neutral-700">
                      {contact.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-neutral-400" aria-hidden="true" />
                          <Link href={`mailto:${contact.email}`} className="hover:underline">
                            {contact.email}
                          </Link>
                        </div>
                      ) : null}
                      {contact.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-neutral-400" aria-hidden="true" />
                          <Link href={`tel:${contact.phone}`} className="hover:underline">
                            {contact.phone}
                          </Link>
                        </div>
                      ) : null}
                      {!contact.email && !contact.phone ? "-" : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ContactStatusBadge status={contact.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/contacts/${contact.id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Bearbeiten
                      </Link>
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
        )}
      </CardContent>
    </Card>
  );
}
