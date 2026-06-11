import {
  ChevronDown,
  Mail,
  MessageSquare,
  Phone,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ContactQuickActions } from "@/components/crm/contact-quick-actions";
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
import { activityTypeLabels, type ActivityWithContext } from "@/lib/db/activities";
import type { Contact } from "@/lib/db/contacts";

type CompanyContactsProps = {
  companyId: string;
  contacts: Contact[];
  activities: ActivityWithContext[];
};

export function CompanyContacts({
  companyId,
  contacts,
  activities,
}: CompanyContactsProps) {
  const activitiesByContact = new Map<string, ActivityWithContext[]>();

  for (const activity of activities) {
    if (!activity.contact_id) {
      continue;
    }

    const contactActivities = activitiesByContact.get(activity.contact_id) ?? [];
    contactActivities.push(activity);
    activitiesByContact.set(activity.contact_id, contactActivities);
  }

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
          <div className="space-y-3 overflow-x-auto">
            <div className="grid min-w-[940px] grid-cols-[minmax(180px,1.2fr)_minmax(120px,0.8fr)_minmax(220px,1.2fr)_152px_220px] gap-4 px-4 text-xs font-medium text-neutral-500 max-lg:hidden">
              <span>Name</span>
              <span>Position</span>
              <span>Kontakt</span>
              <span>Aktivitaet</span>
              <span className="text-right">Verwalten</span>
            </div>
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                companyId={companyId}
                activities={activitiesByContact.get(contact.id) ?? []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactRow({
  contact,
  companyId,
  activities,
}: {
  contact: Contact;
  companyId: string;
  activities: ActivityWithContext[];
}) {
  const contactName = `${contact.first_name} ${contact.last_name}`;

  return (
    <details className="group rounded-md border border-neutral-200 bg-white">
      <summary className="grid cursor-pointer list-none gap-4 p-4 transition hover:bg-neutral-50 lg:min-w-[940px] lg:grid-cols-[minmax(180px,1.2fr)_minmax(120px,0.8fr)_minmax(220px,1.2fr)_152px_220px] lg:items-center [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <ChevronDown
              className="mt-0.5 size-4 shrink-0 text-neutral-400 transition group-open:rotate-180"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-950">{contactName}</span>
                <ContactStatusBadge status={contact.status} compact />
              </div>
              {contact.linkedin_url ? (
                <Link
                  href={contact.linkedin_url}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare className="size-3" aria-hidden="true" />
                  LinkedIn
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="text-sm text-neutral-700">{contact.job_title ?? "-"}</div>

        <ContactLinks contact={contact} />

        <ContactQuickActions
          contact={contact}
          companyId={companyId}
          contactName={contactName}
        />

        <div className="flex justify-end gap-2">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Bearbeiten
          </Link>
          <ContactDeleteForm contactId={contact.id} companyId={contact.company_id} />
        </div>
      </summary>

      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="flex flex-col gap-3 lg:ml-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">
              Aktivitaeten mit {contactName}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {activities.length} Eintraege
            </p>
          </div>
          <ContactQuickActions
            contact={contact}
            companyId={companyId}
            contactName={contactName}
            expanded
          />
        </div>

        {activities.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500 lg:ml-6">
            Noch keine Aktivitaeten fuer diesen Kontakt.
          </div>
        ) : (
          <ol className="mt-4 space-y-3 lg:ml-6">
            {activities.map((activity) => (
              <li key={activity.id} className="rounded-md bg-neutral-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
                    {activityTypeLabels[activity.type]}
                  </span>
                  <time className="text-xs text-neutral-500">
                    {formatDateTime(activity.occurred_at)}
                  </time>
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-950">
                  {activity.title}
                </p>
                {activity.body ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                    {activity.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}

function ContactLinks({ contact }: { contact: Contact }) {
  return (
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
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
