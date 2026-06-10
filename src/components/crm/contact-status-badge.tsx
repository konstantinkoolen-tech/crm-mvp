import { Badge } from "@/components/ui/badge";
import type { ContactStatus } from "@/types/database";

const labels: Record<ContactStatus, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  archived: "Archiviert",
};

export function ContactStatusBadge({
  status,
  compact = false,
}: {
  status: ContactStatus;
  compact?: boolean;
}) {
  return (
    <Badge
      variant={status === "active" ? "default" : "secondary"}
      className={compact ? "px-1.5 py-0 text-[10px] leading-4" : undefined}
    >
      {labels[status]}
    </Badge>
  );
}
