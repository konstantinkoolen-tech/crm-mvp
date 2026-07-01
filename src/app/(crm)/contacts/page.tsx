import { ContactList } from "@/components/crm/contact-list";
import { listContacts } from "@/lib/db/contacts";

export default function ContactsPage() {
  const contactsPromise = listContacts();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Kontakte</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Alle Ansprechpartner über deine Unternehmen hinweg.
        </p>
      </div>

      <ContactsList contactsPromise={contactsPromise} />
    </section>
  );
}

async function ContactsList({
  contactsPromise,
}: {
  contactsPromise: ReturnType<typeof listContacts>;
}) {
  const contacts = await contactsPromise;

  return <ContactList contacts={contacts} />;
}
