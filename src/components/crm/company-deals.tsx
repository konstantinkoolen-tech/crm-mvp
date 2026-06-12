import { Plus } from "lucide-react";
import Link from "next/link";
import { DealCreateButton } from "@/components/crm/company-create-buttons";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
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
import type { Deal } from "@/lib/db/deals";

type CompanyDealsProps = {
  companyId: string;
  deals: Deal[];
};

export function CompanyDeals({ companyId, deals }: CompanyDealsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Deals</CardTitle>
          <CardDescription>Pipeline-Chancen fuer dieses Unternehmen.</CardDescription>
        </div>
        <DealCreateButton companyId={companyId} />
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-950">Noch keine Deals</p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Erstelle einen Deal und ordne ihn diesem Unternehmen zu.
            </p>
            <div className="mt-4">
              <DealCreateButton companyId={companyId} />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Stufe</TableHead>
                <TableHead>Wert</TableHead>
                <TableHead>Abschluss</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium text-neutral-950">
                    <Link href={`/deals/${deal.id}`} className="hover:underline">
                      {deal.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <DealStageBadge stage={deal.stage} />
                  </TableCell>
                  <TableCell>
                    {formatDealValue(deal.value_amount, deal.value_currency)}
                  </TableCell>
                  <TableCell>
                    {deal.expected_close_date
                      ? formatDate(deal.expected_close_date)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/deals/${deal.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Bearbeiten
                    </Link>
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

function formatDealValue(value: Deal["value_amount"], currency: string) {
  if (value === null) {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
