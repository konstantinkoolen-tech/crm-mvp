import { Building2 } from "lucide-react";
import Link from "next/link";
import { CompanyCreateModalButton } from "@/components/crm/company-create-modal-button";
import { CompanyDeleteForm } from "@/components/crm/company-delete-form";
import { CompanyStatusBadge } from "@/components/crm/company-status-badge";
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
import { listCompanies } from "@/lib/db/companies";
import { dealStages, listDeals, type DealWithCompany } from "@/lib/db/deals";

export default async function CompaniesPage() {
  const [companies, deals] = await Promise.all([listCompanies(), listDeals()]);
  const dealsByCompany = groupDealsByCompany(deals);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Unternehmen</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Accounts für Recruiting, Sales und Customer Development verwalten.
          </p>
        </div>
        <CompanyCreateModalButton />
      </div>

      <CompanyList companies={companies} dealsByCompany={dealsByCompany} />
    </section>
  );
}

function CompanyList({
  companies,
  dealsByCompany,
}: {
  companies: Awaited<ReturnType<typeof listCompanies>>;
  dealsByCompany: Map<string, DealWithCompany[]>;
}) {
  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-neutral-100 p-3">
            <Building2 className="size-6 text-neutral-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Noch keine Unternehmen
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Lege den ersten Account an, um Kontakte, Deals und Follow-ups daran
            zu hängen.
          </p>
          <div className="mt-5">
            <CompanyCreateModalButton label="Unternehmen erstellen" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Unternehmen</CardTitle>
        <CardDescription>{companies.length} Einträge</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branche</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deal-Status</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Link
                    href={`/companies/${company.id}`}
                    className="font-medium text-neutral-950 hover:underline"
                  >
                    {company.name}
                  </Link>
                  {company.website ? (
                    <div className="mt-1 truncate text-xs text-neutral-500">
                      {company.website}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{company.industry ?? "-"}</TableCell>
                <TableCell>
                  <CompanyStatusBadge status={company.status} />
                </TableCell>
                <TableCell>
                  <CompanyDealStatus deals={dealsByCompany.get(company.id) ?? []} />
                </TableCell>
                <TableCell>{company.employee_count ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/companies/${company.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-100"
                    >
                      Bearbeiten
                    </Link>
                    <CompanyDeleteForm companyId={company.id} compact />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CompanyDealStatus({ deals }: { deals: DealWithCompany[] }) {
  const stageCounts = dealStages
    .map((stage) => ({
      stage,
      count: deals.filter((deal) => deal.stage === stage).length,
    }))
    .filter((stage) => stage.count > 0);

  if (stageCounts.length === 0) {
    return (
      <Link
        href="/deals"
        className="text-sm text-neutral-500 transition hover:text-neutral-950 hover:underline"
      >
        Keine Deals
      </Link>
    );
  }

  return (
    <Link
      href="/deals"
      className="inline-flex flex-wrap items-center gap-1.5 transition hover:opacity-80"
      aria-label="Zur Deals-Pipeline"
      title="Zur Deals-Pipeline"
    >
      {stageCounts.map(({ stage, count }) => (
        <span className="inline-flex items-center gap-1" key={stage}>
          <DealStageBadge stage={stage} />
          {count > 1 ? (
            <span className="text-xs font-medium text-neutral-500">{count}</span>
          ) : null}
        </span>
      ))}
    </Link>
  );
}

function groupDealsByCompany(deals: DealWithCompany[]) {
  const dealsByCompany = new Map<string, DealWithCompany[]>();

  for (const deal of deals) {
    const companyDeals = dealsByCompany.get(deal.company_id) ?? [];
    companyDeals.push(deal);
    dealsByCompany.set(deal.company_id, companyDeals);
  }

  return dealsByCompany;
}
