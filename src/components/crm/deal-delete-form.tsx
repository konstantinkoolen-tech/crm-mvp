import { Trash2 } from "lucide-react";
import { deleteDeal } from "@/app/(crm)/deals/actions";
import { Button } from "@/components/ui/button";

type DealDeleteFormProps = {
  dealId: string;
  companyId: string;
};

export function DealDeleteForm({ dealId, companyId }: DealDeleteFormProps) {
  return (
    <form action={deleteDeal}>
      <input type="hidden" name="deal_id" value={dealId} />
      <input type="hidden" name="company_id" value={companyId} />
      <Button type="submit" variant="ghost" size="sm">
        <Trash2 aria-hidden="true" />
        Löschen
      </Button>
    </form>
  );
}
