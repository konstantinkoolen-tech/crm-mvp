import { updateContact } from "@/app/(crm)/contacts/actions";
import { ContactForm } from "@/components/crm/contact-form";
import { getContact } from "@/lib/db/contacts";

type EditContactPageProps = {
  params: Promise<{
    contactId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditContactPage({
  params,
  searchParams,
}: EditContactPageProps) {
  const [{ contactId }, { error }] = await Promise.all([params, searchParams]);
  const contact = await getContact(contactId);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">
          Kontakt bearbeiten
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Ansprechpartnerdaten aktualisieren.
        </p>
      </div>
      <ContactForm
        action={updateContact}
        companyId={contact.company_id}
        companyName={contact.company?.name ?? undefined}
        contact={contact}
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
    return "Bitte gib Vorname und Nachname ein.";
  }

  return decodeURIComponent(error);
}
