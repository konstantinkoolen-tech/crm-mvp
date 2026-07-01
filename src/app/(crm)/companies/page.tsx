import { CompanyCreateModalButton } from "@/components/crm/company-create-modal-button";
import { CompanyList } from "@/components/crm/company-list";
import { listCompanies } from "@/lib/db/companies";
import { listDeals, type DealWithCompany } from "@/lib/db/deals";
import { getCurrentProfile, listTeamProfiles } from "@/lib/db/profiles";

export default async function CompaniesPage() {
  const [companies, deals, currentProfile, teamProfiles] = await Promise.all([
    listCompanies(),
    listDeals(),
    getCurrentProfile(),
    listTeamProfiles(),
  ]);
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
        <CompanyCreateModalButton
          currentProfileId={currentProfile.id}
          profiles={teamProfiles}
        />
      </div>

      <CompanyList
        companies={companies}
        currentProfileId={currentProfile.id}
        dealsByCompany={dealsByCompany}
        teamProfiles={teamProfiles}
      />
    </section>
  );
}

function groupDealsByCompany(deals: DealWithCompany[]) {
  const dealsByCompany: Record<string, DealWithCompany[]> = {};

  for (const deal of deals) {
    dealsByCompany[deal.company_id] = [
      ...(dealsByCompany[deal.company_id] ?? []),
      deal,
    ];
  }

  return dealsByCompany;
}
