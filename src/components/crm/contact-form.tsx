"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
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

type ContactFormProps = {
  action: (formData: FormData) => Promise<void>;
  companyId: string;
  companyName?: string;
  contact?: Contact;
  error?: string;
  onCancel?: () => void;
  presentation?: "page" | "modal";
  submitLabel: string;
};

export function ContactForm({
  action,
  companyId,
  companyName,
  contact,
  error,
  onCancel,
  presentation = "page",
  submitLabel,
}: ContactFormProps) {
  const isModal = presentation === "modal";

  return (
    <Card className={isModal ? "border-0 shadow-none" : undefined}>
      {!isModal ? (
        <CardHeader>
          <CardTitle>{contact ? "Kontakt bearbeiten" : "Kontakt erstellen"}</CardTitle>
          <CardDescription>
            {companyName
              ? `Ansprechpartner für ${companyName}`
              : "Ansprechpartner einem Unternehmen zuordnen"}
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={isModal ? "p-0" : undefined}>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action={action} className="space-y-5">
          <input type="hidden" name="company_id" value={companyId} />
          {contact ? <input type="hidden" name="contact_id" value={contact.id} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Vorname</Label>
              <Input
                id="first_name"
                name="first_name"
                required
                defaultValue={contact?.first_name ?? ""}
                placeholder="Mara"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nachname</Label>
              <Input
                id="last_name"
                name="last_name"
                required
                defaultValue={contact?.last_name ?? ""}
                placeholder="Schmidt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email ?? ""}
                placeholder="mara@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact?.phone ?? ""}
                placeholder="+49 ..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Position</Label>
              <Input
                id="job_title"
                name="job_title"
                defaultValue={contact?.job_title ?? ""}
                placeholder="Head of People"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                defaultValue={contact?.linkedin_url ?? ""}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={contact?.status ?? "active"}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={contact?.notes ?? ""}
                placeholder="Rolle im Buying Committee, Kontext, nächster Schritt"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {isModal ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
            ) : (
              <Link
                href={`/companies/${companyId}`}
                className={buttonVariants({ variant: "outline" })}
              >
                Abbrechen
              </Link>
            )}
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
