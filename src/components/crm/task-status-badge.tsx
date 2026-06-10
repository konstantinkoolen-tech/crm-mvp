import { Badge } from "@/components/ui/badge";
import { isTaskOverdue, taskStatusLabels } from "@/lib/db/tasks";
import type { TaskStatus } from "@/types/database";

type TaskStatusBadgeProps = {
  dueDate?: string | null;
  status: TaskStatus;
};

export function TaskStatusBadge({ dueDate, status }: TaskStatusBadgeProps) {
  if (isTaskOverdue({ due_date: dueDate ?? null, status })) {
    return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Ueberfaellig</Badge>;
  }

  return (
    <Badge variant={status === "done" ? "default" : "secondary"}>
      {taskStatusLabels[status]}
    </Badge>
  );
}
