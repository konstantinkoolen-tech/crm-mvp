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
import { dealStageLabels, dealStages, type DealWithCompany } from "@/lib/db/deals";
import type { Company } from "@/lib/db/companies";

type DealFormProps = {
  action: (formData: FormData) => Promise<void>;
  companies: Company[];
  defaultCompanyId?: string;
  deal?: DealWithCompany;
  error?: string;
  submitLabel: string;
};

export function DealForm({
  action,
  companies,
  defaultCompanyId,
  deal,
  error,
  submitLabel,
}: DealFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal ? "Deal bearbeiten" : "Deal erstellen"}</CardTitle>
        <CardDescription>
          Jeder Deal wird einem Unternehmen zugeordnet und einer Pipeline-Stufe
          zugewiesen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {companies.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Lege zuerst ein Unternehmen an, bevor du Deals erstellst.
          </div>
        ) : (
          <form action={action} className="space-y-5">
            {deal ? <input type="hidden" name="deal_id" value={deal.id} /> : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={deal?.title ?? ""}
                  placeholder="Enterprise Recruiting Retainer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Unternehmen</Label>
                <select
                  id="company_id"
                  name="company_id"
                  required
                  defaultValue={deal?.company_id ?? defaultCompanyId ?? ""}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  <option value="" disabled>
                    Unternehmen auswaehlen
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Pipeline-Stufe</Label>
                <select
                  id="stage"
                  name="stage"
                  defaultValue={deal?.stage ?? "lead"}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                >
                  {dealStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {dealStageLabels[stage]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_amount">Wert</Label>
                <Input
                  id="value_amount"
                  name="value_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={deal?.value_amount ?? ""}
                  placeholder="25000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_currency">Waehrung</Label>
                <Input
                  id="value_currency"
                  name="value_currency"
                  maxLength={3}
                  defaultValue={deal?.value_currency ?? "EUR"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Wahrscheinlichkeit</Label>
                <Input
                  id="probability"
                  name="probability"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={deal?.probability ?? ""}
                  placeholder="40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Erwarteter Abschluss</Label>
                <Input
                  id="expected_close_date"
                  name="expected_close_date"
                  type="date"
                  defaultValue={deal?.expected_close_date ?? ""}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={deal?.description ?? ""}
                  placeholder="Kontext, Bedarf, naechster Schritt"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link href="/deals" className={buttonVariants({ variant: "outline" })}>
                Abbrechen
              </Link>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
