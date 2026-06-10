import { Badge } from "@/components/ui/badge";
import { dealStageLabels } from "@/lib/db/deals";
import type { DealStage } from "@/types/database";

export function DealStageBadge({ stage }: { stage: DealStage }) {
  return (
    <Badge variant={stage === "won" ? "default" : "secondary"}>
      {dealStageLabels[stage]}
    </Badge>
  );
}
