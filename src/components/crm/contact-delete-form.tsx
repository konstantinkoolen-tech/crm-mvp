import { Trash2 } from "lucide-react";
import { deleteContact } from "@/app/(crm)/contacts/actions";
import { Button } from "@/components/ui/button";

type ContactDeleteFormProps = {
  contactId: string;
  companyId: string;
};

export function ContactDeleteForm({
  contactId,
  companyId,
}: ContactDeleteFormProps) {
  return (
    <form action={deleteContact}>
      <input type="hidden" name="contact_id" value={contactId} />
      <input type="hidden" name="company_id" value={companyId} />
      <Button type="submit" variant="ghost" size="sm">
        <Trash2 aria-hidden="true" />
        Löschen
      </Button>
    </form>
  );
}
