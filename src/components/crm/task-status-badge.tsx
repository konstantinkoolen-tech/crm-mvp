import { Badge } from "@/components/ui/badge";
import { isTaskOverdue, taskStatusLabels } from "@/lib/tasks/constants";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/database";

type TaskStatusBadgeProps = {
  dueDate?: string | null;
  status: TaskStatus;
};

export function TaskStatusBadge({ dueDate, status }: TaskStatusBadgeProps) {
  if (isTaskOverdue({ due_date: dueDate ?? null, status })) {
    return (
      <Badge
        variant="outline"
        className="whitespace-nowrap border-red-200 bg-red-50 text-red-700"
      >
        Überfällig
      </Badge>
    );
  }

  return (
    <Badge
      variant={status === "done" ? "outline" : "secondary"}
      className={cn(
        "whitespace-nowrap",
        status === "done" &&
          "border-neutral-200 bg-neutral-100 text-neutral-500",
      )}
    >
      {taskStatusLabels[status]}
    </Badge>
  );
}
