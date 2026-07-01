import { deleteCompany } from "@/app/(crm)/companies/actions";
import { DeleteConfirmButton } from "@/components/crm/delete-confirm-button";

type CompanyDeleteFormProps = {
  companyId: string;
  compact?: boolean;
};

export function CompanyDeleteForm({ companyId }: CompanyDeleteFormProps) {
  return (
    <DeleteConfirmButton
      action={deleteCompany}
      description="Willst du das Unternehmen wirklich löschen? Zugeordnete Kontakte, Deals und Aktivitäten können davon betroffen sein."
      fields={[{ name: "company_id", value: companyId }]}
      label="Unternehmen"
    />
  );
}
