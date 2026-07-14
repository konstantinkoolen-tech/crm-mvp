"use client";

import { Building2, Link2, Pencil, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  createCompanyForEvent,
  createContactForEvent,
  createEventAssociation,
  updateEventAssociation,
} from "@/app/(crm)/events/actions";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyWithOwner } from "@/lib/db/companies";
import type { Contact, ContactWithCompany } from "@/lib/db/contacts";
import type { EventAssociationWithContext, EventWithDates } from "@/lib/db/events";
import type { TeamProfile } from "@/lib/db/profiles";
import { formatEventDate } from "@/lib/events/format";
import { ownerDisplayName } from "@/lib/list-display";

type EventCompanyCreateModalButtonProps = {
  event: EventWithDates;
  profiles: TeamProfile[];
};

type EventContactCreateModalButtonProps = {
  companies: CompanyWithOwner[];
  event: EventWithDates;
};

type EventAssociationCreateModalButtonProps = {
  companies: CompanyWithOwner[];
  contacts: ContactWithCompany[];
  event: EventWithDates;
};

type EventAssociationContactOption = Pick<
  Contact,
  "id" | "first_name" | "last_name" | "company_id"
> & {
  company?: { id: string; name: string } | null;
};

type EventAssociationEditModalButtonProps = {
  association: EventAssociationWithContext;
  companies?: Pick<CompanyWithOwner, "id" | "name">[];
  contacts: EventAssociationContactOption[];
  events: EventWithDates[];
  fixedCompanyId?: string;
  fixedEventId?: string;
  returnTo: string;
};

type CompanyEventAssociationButtonProps = {
  companyId: string;
  contactId?: string;
  contacts: Pick<Contact, "id" | "first_name" | "last_name" | "company_id">[];
  events: EventWithDates[];
  label?: string;
  returnTo: string;
};

export function EventCompanyCreateModalButton({
  event,
  profiles,
}: EventCompanyCreateModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Building2 aria-hidden="true" />
        Unternehmen
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event-Zuordnung"
          title="Unternehmen hinzufügen"
          onClose={() => setOpen(false)}
        >
          <form action={createCompanyForEvent} className="space-y-5">
            <input type="hidden" name="event_id" value={event.id} />
            <EventDateSelect dates={event.dates} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-company-name">Name</Label>
                <Input
                  id="event-company-name"
                  name="company_name"
                  required
                  placeholder="Acme GmbH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-company-website">Webseite</Label>
                <Input
                  id="event-company-website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-company-email">Company-E-Mail</Label>
                <Input
                  id="event-company-email"
                  name="company_email"
                  type="email"
                  placeholder="info@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-company-phone">Telefon</Label>
                <Input
                  id="event-company-phone"
                  name="phone"
                  type="tel"
                  placeholder="+49 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-company-industry">Branche</Label>
                <Input
                  id="event-company-industry"
                  name="industry"
                  placeholder="Personalvermittlung"
                />
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Zuständiger Mitarbeiter
                </span>
                <select
                  name="owner_id"
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {profiles
                    .filter((profile) => profile.status === "active")
                    .map((profile) => (
                      <option value={profile.id} key={profile.id}>
                        {ownerDisplayName(profile)}
                      </option>
                    ))}
                </select>
              </label>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-company-notes">Notizen</Label>
                <RichTextTextarea
                  id="event-company-notes"
                  name="notes"
                  placeholder="Kontext aus dem Event"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-company-association-notes">
                  Event-Notiz
                </Label>
                <RichTextTextarea
                  id="event-company-association-notes"
                  name="association_notes"
                  placeholder="Warum ist dieses Unternehmen mit dem Event verbunden?"
                />
              </div>
            </div>

            <FormActions onCancel={() => setOpen(false)} submitLabel="Hinzufügen" />
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function EventContactCreateModalButton({
  companies,
  event,
}: EventContactCreateModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <UserPlus aria-hidden="true" />
        Kontakt
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event-Zuordnung"
          title="Kontakt hinzufügen"
          onClose={() => setOpen(false)}
        >
          <form action={createContactForEvent} className="space-y-5">
            <input type="hidden" name="event_id" value={event.id} />
            <EventDateSelect dates={event.dates} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">
                  Unternehmen
                </span>
                <select
                  name="company_id"
                  required
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="">Auswählen</option>
                  {companies.map((company) => (
                    <option value={company.id} key={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2">
                <Label htmlFor="event-contact-first-name">Vorname</Label>
                <Input id="event-contact-first-name" name="first_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-contact-last-name">Nachname</Label>
                <Input id="event-contact-last-name" name="last_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-contact-email">E-Mail</Label>
                <Input id="event-contact-email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-contact-phone">Telefon</Label>
                <Input id="event-contact-phone" name="phone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-contact-job-title">Position</Label>
                <Input id="event-contact-job-title" name="job_title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-contact-linkedin">LinkedIn</Label>
                <Input id="event-contact-linkedin" name="linkedin_url" type="url" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-contact-notes">Kontakt-Notizen</Label>
                <RichTextTextarea
                  id="event-contact-notes"
                  name="notes"
                  placeholder="Kontext aus dem Gespräch"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-contact-association-notes">
                  Event-Notiz
                </Label>
                <RichTextTextarea
                  id="event-contact-association-notes"
                  name="association_notes"
                  placeholder="Bei diesem Event kennengelernt, Gesprächskontext, Follow-up"
                />
              </div>
            </div>

            <FormActions onCancel={() => setOpen(false)} submitLabel="Hinzufügen" />
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function EventAssociationCreateModalButton({
  companies,
  contacts,
  event,
}: EventAssociationCreateModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const selectedContact = contacts.find((contact) => contact.id === contactId);
  const resolvedCompanyId = selectedContact?.company_id ?? companyId;

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Link2 aria-hidden="true" />
        Zuordnung
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event-Zuordnung"
          title="Bestehendes Objekt zuordnen"
          onClose={() => setOpen(false)}
        >
          <form action={createEventAssociation} className="space-y-5">
            <input type="hidden" name="event_id" value={event.id} />
            <input type="hidden" name="company_id" value={resolvedCompanyId} />
            <input type="hidden" name="return_to" value={`/events/${event.id}`} />
            <EventDateSelect dates={event.dates} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Unternehmen
                </span>
                <select
                  value={companyId}
                  onChange={(event) => {
                    setCompanyId(event.target.value);
                    setContactId("");
                  }}
                  disabled={Boolean(contactId)}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition disabled:bg-neutral-100 disabled:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="">Auswählen</option>
                  {companies.map((company) => (
                    <option value={company.id} key={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Kontakt optional
                </span>
                <select
                  name="contact_id"
                  value={contactId}
                  onChange={(event) => {
                    setContactId(event.target.value);
                    setCompanyId("");
                  }}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="">Kein Kontakt</option>
                  {contacts.map((contact) => (
                    <option value={contact.id} key={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.company ? ` · ${contact.company.name}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="event-existing-association-notes">Notiz</Label>
                <RichTextTextarea
                  id="event-existing-association-notes"
                  name="association_notes"
                  placeholder="Event-Kontext zu dieser Zuordnung"
                />
              </div>
            </div>

            <FormActions onCancel={() => setOpen(false)} submitLabel="Zuordnen" />
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function EventAssociationEditModalButton({
  association,
  companies = [],
  contacts,
  events,
  fixedCompanyId,
  fixedEventId,
  returnTo,
}: EventAssociationEditModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState(fixedEventId ?? association.event_id);
  const [companyId, setCompanyId] = useState(
    fixedCompanyId ?? association.company_id,
  );
  const [contactId, setContactId] = useState(association.contact_id ?? "");
  const selectedEvent = events.find((event) => event.id === eventId);
  const selectedContact = contacts.find((contact) => contact.id === contactId);
  const resolvedCompanyId =
    fixedCompanyId ?? selectedContact?.company_id ?? companyId;
  const availableContacts = fixedCompanyId
    ? contacts.filter((contact) => contact.company_id === fixedCompanyId)
    : companyId
      ? contacts.filter((contact) => contact.company_id === companyId)
      : contacts;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Event-Zuordnung bearbeiten"
        onClick={() => setOpen(true)}
      >
        <Pencil aria-hidden="true" />
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event-Zuordnung"
          title="Zuordnung bearbeiten"
          onClose={() => setOpen(false)}
        >
          <form action={updateEventAssociation} className="space-y-5">
            <input
              type="hidden"
              name="association_id"
              value={association.id}
            />
            <input type="hidden" name="company_id" value={resolvedCompanyId} />
            <input type="hidden" name="return_to" value={returnTo} />
            {fixedEventId ? (
              <input type="hidden" name="event_id" value={fixedEventId} />
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {fixedEventId ? null : (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Event
                  </span>
                  <select
                    name="event_id"
                    value={eventId}
                    onChange={(event) => setEventId(event.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                  >
                    {events.map((event) => (
                      <option value={event.id} key={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <EventDateSelect
                dates={selectedEvent?.dates ?? []}
                defaultValue={association.event_date_id ?? ""}
              />

              {fixedCompanyId ? null : (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Unternehmen
                  </span>
                  <select
                    value={companyId}
                    onChange={(event) => {
                      setCompanyId(event.target.value);
                      setContactId("");
                    }}
                    disabled={Boolean(contactId)}
                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition disabled:bg-neutral-100 disabled:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                  >
                    <option value="">Auswählen</option>
                    {companies.map((company) => (
                      <option value={company.id} key={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Kontakt optional
                </span>
                <select
                  name="contact_id"
                  value={contactId}
                  onChange={(event) => {
                    const nextContactId = event.target.value;
                    const nextContact = contacts.find(
                      (contact) => contact.id === nextContactId,
                    );

                    setContactId(nextContactId);
                    setCompanyId(
                      nextContact?.company_id ??
                        fixedCompanyId ??
                        association.company_id,
                    );
                  }}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="">Kein Kontakt</option>
                  {availableContacts.map((contact) => (
                    <option value={contact.id} key={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.company ? ` · ${contact.company.name}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`event-association-notes-${association.id}`}>
                  Notiz
                </Label>
                <RichTextTextarea
                  id={`event-association-notes-${association.id}`}
                  name="association_notes"
                  defaultValue={association.notes ?? ""}
                  placeholder="Event-Kontext zu dieser Zuordnung"
                />
              </div>
            </div>

            <FormActions onCancel={() => setOpen(false)} submitLabel="Speichern" />
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

export function CompanyEventAssociationButton({
  companyId,
  contactId,
  contacts,
  events,
  label = "Event zuordnen",
  returnTo,
}: CompanyEventAssociationButtonProps) {
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const selectedEvent = events.find((event) => event.id === eventId);
  const availableContacts = contactId
    ? contacts.filter((contact) => contact.id === contactId)
    : contacts.filter((contact) => contact.company_id === companyId);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <ModalShell
          eyebrow="Event-Zuordnung"
          title={label}
          onClose={() => setOpen(false)}
        >
          <form action={createEventAssociation} className="space-y-5">
            <input type="hidden" name="company_id" value={companyId} />
            <input type="hidden" name="return_to" value={returnTo} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Event
                </span>
                <select
                  name="event_id"
                  value={eventId}
                  onChange={(event) => setEventId(event.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {events.map((event) => (
                    <option value={event.id} key={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </label>
              <EventDateSelect dates={selectedEvent?.dates ?? []} />
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">
                  Kontakt optional
                </span>
                <select
                  name="contact_id"
                  defaultValue={contactId ?? ""}
                  disabled={Boolean(contactId)}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition disabled:bg-neutral-100 disabled:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="">Kein Kontakt</option>
                  {availableContacts.map((contact) => (
                    <option value={contact.id} key={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </option>
                  ))}
                </select>
                {contactId ? (
                  <input type="hidden" name="contact_id" value={contactId} />
                ) : null}
              </label>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`company-event-notes-${contactId ?? companyId}`}>
                  Notiz
                </Label>
                <RichTextTextarea
                  id={`company-event-notes-${contactId ?? companyId}`}
                  name="association_notes"
                  placeholder="Bei diesem Event kennengelernt, Gesprächskontext, Follow-up"
                />
              </div>
            </div>

            <FormActions onCancel={() => setOpen(false)} submitLabel="Zuordnen" />
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}

function EventDateSelect({
  dates,
  defaultValue = "",
}: {
  dates: EventWithDates["dates"];
  defaultValue?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-neutral-700">Datum</span>
      <select
        name="event_date_id"
        defaultValue={defaultValue}
        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
      >
        <option value="">Ohne konkretes Datum</option>
        {dates.map((date) => (
          <option value={date.id} key={date.id}>
            {formatEventDate(date.event_date)}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Abbrechen
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
}
