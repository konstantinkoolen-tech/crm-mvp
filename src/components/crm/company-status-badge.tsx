import { Badge } from "@/components/ui/badge";
import type { CompanyStatus } from "@/types/database";

const labels: Record<CompanyStatus, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  archived: "Archiviert",
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return <Badge variant={status === "active" ? "default" : "secondary"}>{labels[status]}</Badge>;
}
