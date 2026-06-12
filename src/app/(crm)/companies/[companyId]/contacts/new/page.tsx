import { createContact } from "@/app/(crm)/contacts/actions";
import { ContactForm } from "@/components/crm/contact-form";
import { getCompany } from "@/lib/db/companies";

type NewContactPageProps = {
  params: Promise<{
    companyId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewContactPage({
  params,
  searchParams,
}: NewContactPageProps) {
  const [{ companyId }, { error }] = await Promise.all([params, searchParams]);
  const company = await getCompany(companyId);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">
          Kontakt erstellen
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Neuer Ansprechpartner für {company.name}.
        </p>
      </div>
      <ContactForm
        action={createContact}
        companyId={company.id}
        companyName={company.name}
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
    return "Bitte gib Vorname und Nachname ein.";
  }

  return decodeURIComponent(error);
}
