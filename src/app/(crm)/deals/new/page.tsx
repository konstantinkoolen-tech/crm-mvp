import { createDeal } from "@/app/(crm)/deals/actions";
import { DealForm } from "@/components/crm/deal-form";
import { listCompanies } from "@/lib/db/companies";

type NewDealPageProps = {
  searchParams: Promise<{
    companyId?: string;
    error?: string;
  }>;
};

export default async function NewDealPage({ searchParams }: NewDealPageProps) {
  const [{ companyId, error }, companies] = await Promise.all([
    searchParams,
    listCompanies(),
  ]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Deal erstellen</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Lege einen Deal fuer ein Unternehmen an und starte ihn in der Pipeline.
        </p>
      </div>
      <DealForm
        action={createDeal}
        companies={companies}
        defaultCompanyId={companyId}
        error={errorMessage(error)}
        submitLabel="Erstellen"
      />
    </section>
  );
}

function errorMessage(error?: string) {
  if (!error) {
    return undefined;
  }

  if (error === "missing_company") {
    return "Bitte waehle ein Unternehmen aus.";
  }

  if (error === "missing_title") {
    return "Bitte gib einen Deal-Titel ein.";
  }

  return decodeURIComponent(error);
}
