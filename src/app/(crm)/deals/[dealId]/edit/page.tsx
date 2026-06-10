import { updateDeal } from "@/app/(crm)/deals/actions";
import { DealForm } from "@/components/crm/deal-form";
import { listCompanies } from "@/lib/db/companies";
import { getDeal } from "@/lib/db/deals";

type EditDealPageProps = {
  params: Promise<{
    dealId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditDealPage({
  params,
  searchParams,
}: EditDealPageProps) {
  const [{ dealId }, { error }, companies] = await Promise.all([
    params,
    searchParams,
    listCompanies(),
  ]);
  const deal = await getDeal(dealId);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Deal bearbeiten</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Pipeline-Stufe, Wert und Abschlussdatum aktualisieren.
        </p>
      </div>
      <DealForm
        action={updateDeal}
        companies={companies}
        deal={deal}
        error={errorMessage(error)}
        submitLabel="Speichern"
      />
    </section>
  );
}

function errorMessage(error?: string) {
  if (!error) {
    return undefined;
  }

  if (error === "missing_title") {
    return "Bitte gib einen Deal-Titel ein.";
  }

  return decodeURIComponent(error);
}
