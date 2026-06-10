import { Badge } from "@/components/ui/badge";
import type { ContactStatus } from "@/types/database";

const labels: Record<ContactStatus, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  archived: "Archiviert",
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return <Badge variant={status === "active" ? "default" : "secondary"}>{labels[status]}</Badge>;
}
