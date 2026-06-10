import { Trash2 } from "lucide-react";
import { deleteCompany } from "@/app/(crm)/companies/actions";
import { Button } from "@/components/ui/button";

type CompanyDeleteFormProps = {
  companyId: string;
  compact?: boolean;
};

export function CompanyDeleteForm({ companyId, compact }: CompanyDeleteFormProps) {
  return (
    <form action={deleteCompany}>
      <input type="hidden" name="company_id" value={companyId} />
      <Button
        type="submit"
        variant={compact ? "ghost" : "destructive"}
        size={compact ? "sm" : "default"}
      >
        <Trash2 aria-hidden="true" />
        Loeschen
      </Button>
    </form>
  );
}
