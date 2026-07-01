"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CompanyCreateModalButton } from "@/components/crm/company-create-modal-button";
import { CompanyDeleteForm } from "@/components/crm/company-delete-form";
import { CompanyEditModalButton } from "@/components/crm/company-edit-modal-button";
import { CompanyStatusBadge } from "@/components/crm/company-status-badge";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
import { ListFilterBar } from "@/components/crm/list-filter-bar";
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
import {
  employeeCountFromValue,
  employeeCountSortValue,
} from "@/lib/companies/employee-count";
import { companyStatusLabels } from "@/lib/companies/status";
import type { CompanyWithOwner } from "@/lib/db/companies";
import type { DealWithCompany } from "@/lib/db/deals";
import type { TeamProfile } from "@/lib/db/profiles";
import { dealStages } from "@/lib/deals/constants";
import { ownerDisplayName } from "@/lib/list-display";

type CompanySort = "updated_desc" | "name_asc" | "employees_desc" | "created_desc";

export function CompanyList({
  companies,
  currentProfileId,
  dealsByCompany,
  teamProfiles,
}: {
  companies: CompanyWithOwner[];
  currentProfileId: string;
  dealsByCompany: Record<string, DealWithCompany[]>;
  teamProfiles: TeamProfile[];
}) {
  const [sort, setSort] = useState<CompanySort>("updated_desc");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>();
    for (const company of companies) {
      if (company.owner) {
        owners.set(company.owner.id, ownerDisplayName(company.owner));
      }
    }
    return Array.from(owners, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [companies]);

  const visibleCompanies = useMemo(() => {
    return [...companies]
      .filter((company) => owner === "all" || company.owner_id === owner)
      .filter((company) => status === "all" || company.status === status)
      .sort((a, b) => {
        if (sort === "name_asc") {
          return a.name.localeCompare(b.name);
        }
        if (sort === "employees_desc") {
          return (
            employeeCountSortValue(b.employee_count) -
            employeeCountSortValue(a.employee_count)
          );
        }
        if (sort === "created_desc") {
          return dateValue(b.created_at) - dateValue(a.created_at);
        }
        return dateValue(b.updated_at) - dateValue(a.updated_at);
      });
  }, [companies, owner, sort, status]);

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
            <CompanyCreateModalButton
              currentProfileId={currentProfileId}
              label="Unternehmen erstellen"
              profiles={teamProfiles}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Unternehmen</CardTitle>
        <CardDescription>
          {visibleCompanies.length} von {companies.length} Einträgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ListFilterBar
          sortValue={sort}
          sortOptions={[
            { value: "updated_desc", label: "Zuletzt aktualisiert" },
            { value: "name_asc", label: "Name A-Z" },
            { value: "employees_desc", label: "Mitarbeiter absteigend" },
            { value: "created_desc", label: "Erstellt zuletzt" },
          ]}
          onSortChange={(value) => setSort(value as CompanySort)}
          ownerValue={owner}
          ownerOptions={ownerOptions}
          onOwnerChange={setOwner}
          statusValue={status}
          statusOptions={Object.entries(companyStatusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onStatusChange={setStatus}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branche</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deal-Status</TableHead>
              <TableHead>Zuständig</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCompanies.map((company) => (
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
                  <CompanyDealStatus deals={dealsByCompany[company.id] ?? []} />
                </TableCell>
                <TableCell>{ownerDisplayName(company.owner)}</TableCell>
                <TableCell>
                  {employeeCountFromValue(company.employee_count) ?? "-"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <CompanyEditModalButton
                      company={company}
                      compact
                      profiles={teamProfiles}
                    />
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

function dateValue(value: string) {
  return new Date(value).getTime();
}
