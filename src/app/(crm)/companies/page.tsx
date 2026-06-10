import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { CompanyDeleteForm } from "@/components/crm/company-delete-form";
import { CompanyStatusBadge } from "@/components/crm/company-status-badge";
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
import { listCompanies } from "@/lib/db/companies";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Unternehmen</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Accounts fuer Recruiting, Sales und Customer Development verwalten.
          </p>
        </div>
        <Link href="/companies/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Neu
        </Link>
      </div>

      <CompanyList companies={companies} />
    </section>
  );
}

function CompanyList({ companies }: { companies: Awaited<ReturnType<typeof listCompanies>> }) {
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
            zu haengen.
          </p>
          <Link href="/companies/new" className={buttonVariants({ className: "mt-5" })}>
            <Plus aria-hidden="true" />
            Unternehmen erstellen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Unternehmen</CardTitle>
        <CardDescription>{companies.length} Eintraege</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branche</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>{company.employee_count ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/companies/${company.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
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
