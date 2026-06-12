import { createActivity } from "@/app/(crm)/activities/actions";
import { createTask } from "@/app/(crm)/tasks/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/db/contacts";

type CompanyActionFormsProps = {
  companyId: string;
  contacts: Contact[];
  error?: string;
};

export function CompanyActionForms({
  companyId,
  contacts,
  error,
}: CompanyActionFormsProps) {
  const returnTo = `/companies/${companyId}`;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task erstellen</CardTitle>
          <CardDescription>Follow-up für dieses Unternehmen planen.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <ErrorMessage message={error} /> : null}

          <form action={createTask} className="space-y-4">
            <input type="hidden" name="company_id" value={companyId} />
            <input type="hidden" name="status" value="open" />
            <input type="hidden" name="return_to" value={returnTo} />

            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor="company-task-title">Aufgabe</Label>
                <Input
                  id="company-task-title"
                  name="title"
                  required
                  placeholder="Follow-up vorbereiten"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-task-due-date">Fällig am</Label>
                <Input
                  id="company-task-due-date"
                  name="due_date"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-task-contact">Kontakt</Label>
              <select
                id="company-task-contact"
                name="contact_id"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="">Nur Unternehmen</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-task-description">Task-Inhalt</Label>
              <Textarea
                id="company-task-description"
                name="description"
                rows={4}
                placeholder="Was soll als nächstes passieren?"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Task speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notiz speichern</CardTitle>
          <CardDescription>
            Unternehmensnotiz ohne konkreten Ansprechpartner erfassen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createActivity} className="space-y-4">
            <input type="hidden" name="company_id" value={companyId} />
            <input type="hidden" name="type" value="note" />
            <input type="hidden" name="return_to" value={returnTo} />

            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label htmlFor="company-note-title">Titel</Label>
                <Input
                  id="company-note-title"
                  name="title"
                  required
                  placeholder="Interne Unternehmensnotiz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-note-date">Datum und Uhrzeit</Label>
                <Input
                  id="company-note-date"
                  name="occurred_at"
                  type="datetime-local"
                  defaultValue={defaultDateTimeValue()}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-note-body">Notiz</Label>
              <Textarea
                id="company-note-body"
                name="body"
                rows={6}
                required
                placeholder="Was ist passiert? Warum ist es relevant?"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Notiz speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}

function defaultDateTimeValue() {
  const date = new Date();
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
