import { CheckCircle2, PlayCircle, Trash2 } from "lucide-react";
import type React from "react";
import { deleteTask, updateTaskStatus } from "@/app/(crm)/tasks/actions";
import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/types/database";

type TaskActionsProps = {
  taskId: string;
  status: TaskStatus;
};

export function TaskActions({ taskId, status }: TaskActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "open" ? (
        <TaskStatusButton taskId={taskId} status="in_progress">
          <PlayCircle aria-hidden="true" />
          Starten
        </TaskStatusButton>
      ) : null}
      {status !== "done" && status !== "canceled" ? (
        <TaskStatusButton taskId={taskId} status="done">
          <CheckCircle2 aria-hidden="true" />
          Erledigt
        </TaskStatusButton>
      ) : null}
      <form action={deleteTask}>
        <input type="hidden" name="task_id" value={taskId} />
        <Button type="submit" variant="ghost" size="sm">
          <Trash2 aria-hidden="true" />
          Löschen
        </Button>
      </form>
    </div>
  );
}

function TaskStatusButton({
  children,
  taskId,
  status,
}: {
  children: React.ReactNode;
  taskId: string;
  status: TaskStatus;
}) {
  return (
    <form action={updateTaskStatus}>
      <input type="hidden" name="task_id" value={taskId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" size="sm">
        {children}
      </Button>
    </form>
  );
}
