import { Badge } from "@/components/ui/badge";
import { companyStatusLabels } from "@/lib/companies/status";
import type { CompanyStatus } from "@/types/database";

const statusColors: Record<CompanyStatus, string> = {
  new: "border-transparent bg-neutral-950 text-white",
  contacted: "border-transparent bg-neutral-200 text-neutral-950",
  in_exchange: "border-neutral-300 bg-white text-neutral-950",
  active_customer: "border-transparent bg-green-600 text-white",
  lost_customer: "border-red-200 bg-red-50 text-red-600",
  churn: "border-red-900/20 bg-red-900/15 text-red-950",
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <Badge variant="outline" className={statusColors[status]}>
      {companyStatusLabels[status]}
    </Badge>
  );
}
