import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { Company } from "@/lib/db/companies";

type CompanyFormProps = {
  action: (formData: FormData) => Promise<void>;
  company?: Company;
  error?: string;
  submitLabel: string;
};

export function CompanyForm({
  action,
  company,
  error,
  submitLabel,
}: CompanyFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {company ? "Unternehmen bearbeiten" : "Unternehmen erstellen"}
        </CardTitle>
        <CardDescription>
          Pflege die Basisdaten für Account Management und Pipeline-Arbeit.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <Input
                id="employee_count"
                name="employee_count"
                type="number"
                min="0"
                defaultValue={company?.employee_count ?? ""}
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={company?.status ?? "active"}
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
                defaultValue={company?.notes ?? ""}
                placeholder="Kurze Account-Notiz"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={company ? `/companies/${company.id}` : "/companies"}
              className={buttonVariants({ variant: "outline" })}
            >
              Abbrechen
            </Link>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
