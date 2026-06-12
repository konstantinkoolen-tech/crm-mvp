import { createCompany } from "@/app/(crm)/companies/actions";
import { CompanyForm } from "@/components/crm/company-form";

type NewCompanyPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewCompanyPage({
  searchParams,
}: NewCompanyPageProps) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">
          Unternehmen erstellen
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Erstelle einen neuen Account als Grundlage für Kontakte und Deals.
        </p>
      </div>
      <CompanyForm
        action={createCompany}
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

  if (error === "missing_name") {
    return "Bitte gib einen Unternehmensnamen ein.";
  }

  return decodeURIComponent(error);
}
