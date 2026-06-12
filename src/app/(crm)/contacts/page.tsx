import { Users } from "lucide-react";
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
import { listContacts } from "@/lib/db/contacts";

export default function ContactsPage() {
  const contactsPromise = listContacts();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Kontakte</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Alle Ansprechpartner über deine Unternehmen hinweg.
        </p>
      </div>

      <ContactsList contactsPromise={contactsPromise} />
    </section>
  );
}

async function ContactsList({
  contactsPromise,
}: {
  contactsPromise: ReturnType<typeof listContacts>;
}) {
  const contacts = await contactsPromise;

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
        <CardDescription>{contacts.length} Einträge</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unternehmen</TableHead>
              <TableHead>Position</TableHead>
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
      </CardContent>
    </Card>
  );
}
