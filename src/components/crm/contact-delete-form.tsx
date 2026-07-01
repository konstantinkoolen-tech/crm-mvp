import { deleteContact } from "@/app/(crm)/contacts/actions";
import { DeleteConfirmButton } from "@/components/crm/delete-confirm-button";

type ContactDeleteFormProps = {
  contactId: string;
  companyId: string;
};

export function ContactDeleteForm({
  contactId,
  companyId,
}: ContactDeleteFormProps) {
  return (
    <DeleteConfirmButton
      action={deleteContact}
      description="Willst du den Kontakt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      fields={[
        { name: "contact_id", value: contactId },
        { name: "company_id", value: companyId },
      ]}
      label="Kontakt"
    />
  );
}
