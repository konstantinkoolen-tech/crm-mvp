import { updateCompany } from "@/app/(crm)/companies/actions";
import { CompanyForm } from "@/components/crm/company-form";
import { getCompany } from "@/lib/db/companies";

type EditCompanyPageProps = {
  params: Promise<{
    companyId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditCompanyPage({
  params,
  searchParams,
}: EditCompanyPageProps) {
  const [{ companyId }, { error }] = await Promise.all([params, searchParams]);
  const company = await getCompany(companyId);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">
          Unternehmen bearbeiten
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Aktualisiere Account-Daten, Status und Notizen.
        </p>
      </div>
      <CompanyForm
        action={updateCompany}
        company={company}
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

  if (error === "missing_name") {
    return "Bitte gib einen Unternehmensnamen ein.";
  }

  return decodeURIComponent(error);
}
