import { createActivity } from "@/app/(crm)/activities/actions";
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
import { activityTypeLabels } from "@/lib/activities/constants";
import type { Contact } from "@/lib/db/contacts";
import type { ActivityType } from "@/types/database";

type ActivityFormProps = {
  companyId?: string;
  dealId?: string;
  contacts?: Contact[];
  returnTo: string;
  error?: string;
};

const activityTypes: ActivityType[] = [
  "note",
  "linkedin_message",
  "call",
  "email",
  "meeting",
];

export function ActivityForm({
  companyId,
  dealId,
  contacts = [],
  returnTo,
  error,
}: ActivityFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivität erfassen</CardTitle>
        <CardDescription>Notiz, Call, E-Mail oder Meeting speichern.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action={createActivity} className="space-y-4">
          {companyId ? <input type="hidden" name="company_id" value={companyId} /> : null}
          {dealId ? <input type="hidden" name="deal_id" value={dealId} /> : null}
          <input type="hidden" name="return_to" value={returnTo} />

          <div className="grid gap-4 md:grid-cols-[180px_220px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <select
                id="type"
                name="type"
                defaultValue="note"
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {activityTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_id">Kontakt</Label>
              <select
                id="contact_id"
                name="contact_id"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="">Unternehmen</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Follow-up Call mit Hiring Team"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Notiz</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Was wurde besprochen? Was ist der nächste Schritt?"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Speichern</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
