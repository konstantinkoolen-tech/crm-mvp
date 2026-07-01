import { deleteDeal } from "@/app/(crm)/deals/actions";
import { DeleteConfirmButton } from "@/components/crm/delete-confirm-button";

type DealDeleteFormProps = {
  dealId: string;
  companyId: string;
};

export function DealDeleteForm({ dealId, companyId }: DealDeleteFormProps) {
  return (
    <DeleteConfirmButton
      action={deleteDeal}
      description="Willst du den Deal wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      fields={[
        { name: "deal_id", value: dealId },
        { name: "company_id", value: companyId },
      ]}
      label="Deal"
    />
  );
}
