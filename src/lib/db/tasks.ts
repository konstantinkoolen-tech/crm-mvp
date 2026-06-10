import { notFound } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
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

export type Task = {
  id: string;
  owner_id: string;
  company_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithContext = Task & {
  company: {
    id: string;
    name: string;
  } | null;
  deal: {
    id: string;
    title: string;
  } | null;
};

const taskSelect =
  "id, owner_id, company_id, contact_id, deal_id, title, description, status, due_date, completed_at, created_at, updated_at";

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

export function isTaskOverdue(task: Pick<Task, "due_date" | "status">) {
  return (
    Boolean(task.due_date) &&
    task.due_date! < todayDateString() &&
    task.status !== "done" &&
    task.status !== "canceled"
  );
}

export async function listTasks() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`${taskSelect}, company:companies(id, name), deal:deals(id, title)`)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TaskWithContext[];
}

export async function listOpenTasks() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`${taskSelect}, company:companies(id, name), deal:deals(id, title)`)
    .in("status", ["open", "in_progress"])
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TaskWithContext[];
}

export async function listOverdueTasks() {
  const tasks = await listOpenTasks();
  return tasks.filter(isTaskOverdue);
}

export async function getTask(taskId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`${taskSelect}, company:companies(id, name), deal:deals(id, title)`)
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as unknown as TaskWithContext;
}
