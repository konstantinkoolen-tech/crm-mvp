import { createCompany } from "@/app/(crm)/companies/actions";
import { CompanyForm } from "@/components/crm/company-form";
import { getCurrentProfile, listTeamProfiles } from "@/lib/db/profiles";

type NewCompanyPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewCompanyPage({
  searchParams,
}: NewCompanyPageProps) {
  const { error } = await searchParams;
  const [currentProfile, teamProfiles] = await Promise.all([
    getCurrentProfile(),
    listTeamProfiles(),
  ]);

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
        currentProfileId={currentProfile.id}
        error={errorMessage(error)}
        profiles={teamProfiles}
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
