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
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { TaskOwnerSelect } from "@/components/crm/task-owner-select";
import {
  employeeCountFromValue,
  employeeCountOptions,
} from "@/lib/companies/employee-count";
import type { Company } from "@/lib/db/companies";
import type { TeamProfile } from "@/lib/db/profiles";

type CompanyFormProps = {
  action: (formData: FormData) => Promise<void>;
  company?: Company;
  currentProfileId?: string;
  error?: string;
  onCancel?: () => void;
  presentation?: "page" | "modal";
  profiles?: TeamProfile[];
  submitLabel: string;
};

export function CompanyForm({
  action,
  company,
  currentProfileId,
  error,
  onCancel,
  presentation = "page",
  profiles = [],
  submitLabel,
}: CompanyFormProps) {
  const isModal = presentation === "modal";
  const defaultOwnerId = company?.owner_id ?? currentProfileId;

  return (
    <Card className={isModal ? "border-0 shadow-none" : undefined}>
      {!isModal ? (
        <CardHeader>
          <CardTitle>
            {company ? "Unternehmen bearbeiten" : "Unternehmen erstellen"}
          </CardTitle>
          <CardDescription>
            Pflege die Basisdaten für Account Management und Pipeline-Arbeit.
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
          {company ? <input type="hidden" name="company_id" value={company.id} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={company?.name ?? ""}
                placeholder="Acme GmbH"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={company?.website ?? ""}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={company?.phone ?? ""}
                placeholder="+49 30 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_email">Company-E-Mail</Label>
              <Input
                id="company_email"
                name="company_email"
                defaultValue={company?.company_email ?? ""}
                placeholder="info@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={company?.industry ?? ""}
                placeholder="SaaS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_count">Mitarbeiter</Label>
              <select
                id="employee_count"
                name="employee_count"
                defaultValue={employeeCountFromValue(company?.employee_count) ?? ""}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="">Auswählen</option>
                {employeeCountOptions.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {profiles.length > 0 ? (
              <TaskOwnerSelect
                id={`company-owner-${company?.id ?? "new"}`}
                label="Zuständiger Mitarbeiter"
                defaultOwnerId={defaultOwnerId}
                profiles={profiles}
              />
            ) : null}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notizen</Label>
              <RichTextTextarea
                id="notes"
                name="notes"
                defaultValue={company?.notes ?? ""}
                placeholder="Kurze Account-Notiz"
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
                href={company ? `/companies/${company.id}` : "/companies"}
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
