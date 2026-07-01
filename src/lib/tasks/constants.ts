import type { TaskStatus } from "@/types/database";

export const taskStatuses = [
  "open",
  "in_progress",
  "done",
  "canceled",
] as const satisfies readonly TaskStatus[];

export const taskStatusLabels: Record<TaskStatus, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  done: "Erledigt",
  canceled: "Abgebrochen",
};

export function todayDateString() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: {
  due_date: string | null;
  status: TaskStatus;
}) {
  return (
    Boolean(task.due_date) &&
    task.due_date! <= todayDateString() &&
    task.status !== "done" &&
    task.status !== "canceled"
  );
}

export type TaskDueDateState = "past" | "today" | "future";

export function taskDueDateState(dueDate: string | null): TaskDueDateState | null {
  if (!dueDate) {
    return null;
  }

  const today = todayDateString();

  if (dueDate < today) {
    return "past";
  }

  if (dueDate === today) {
    return "today";
  }

  return "future";
}
