import { Plus } from "lucide-react";
import Link from "next/link";
import { DealCreateButton } from "@/components/crm/company-create-buttons";
import { DealEditModalButton } from "@/components/crm/deal-edit-modal-button";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
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
import type { Company } from "@/lib/db/companies";
import type { Deal } from "@/lib/db/deals";
import { dealStatusLabels } from "@/lib/deals/constants";
import { formatDealValuePair } from "@/lib/deals/value";

type CompanyDealsProps = {
  companyId: string;
  companies: Company[];
  deals: Deal[];
};

export function CompanyDeals({
  companyId,
  companies,
  deals,
}: CompanyDealsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Deals</CardTitle>
          <CardDescription>
            Pipeline-Chancen für dieses Unternehmen.
          </CardDescription>
        </div>
        <DealCreateButton companyId={companyId} />
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-md border border-dashed border-neutral-200 text-center">
            <p className="text-sm font-medium text-neutral-950">
              Noch keine Deals
            </p>
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
                <TableHead>Status</TableHead>
                <TableHead>MRR / ARR</TableHead>
                <TableHead>Abschluss</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium text-neutral-950">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <DealStageBadge stage={deal.stage} />
                  </TableCell>
                  <TableCell>{dealStatusLabels[deal.status]}</TableCell>
                  <TableCell>
                    <DealValueCell deal={deal} />
                  </TableCell>
                  <TableCell>
                    {deal.expected_close_date
                      ? formatDate(deal.expected_close_date)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DealEditModalButton companies={companies} deal={deal} />
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

function DealValueCell({ deal }: { deal: Deal }) {
  const formattedValue = formatDealValuePair(
    deal.value_amount,
    deal.value_currency,
    deal.value_period,
  );

  if (!formattedValue) {
    return "-";
  }

  return (
    <span className="space-y-0.5">
      <span className="block text-neutral-950">MRR {formattedValue.mrr}</span>
      <span className="block text-xs text-neutral-500">
        ARR {formattedValue.arr}
      </span>
    </span>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
