import { notFound } from "next/navigation";
import { getCompanyClient, type ListOwner } from "@/lib/db/companies";
import { isTaskOverdue, taskStatusLabels, taskStatuses } from "@/lib/tasks/constants";
import type { TaskStatus } from "@/types/database";

export { isTaskOverdue, taskStatusLabels, taskStatuses };

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
  owner: ListOwner | null;
};

const taskSelect =
  "id, owner_id, company_id, contact_id, deal_id, title, description, status, due_date, completed_at, created_at, updated_at";

export async function listTasks() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `${taskSelect}, company:companies(id, name), deal:deals(id, title), owner:profiles!tasks_owner_id_fkey(id, email, full_name, display_name)`,
    )
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
    .select(
      `${taskSelect}, company:companies(id, name), deal:deals(id, title), owner:profiles!tasks_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .in("status", ["open", "in_progress"])
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TaskWithContext[];
}

export async function listTasksForCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `${taskSelect}, company:companies(id, name), deal:deals(id, title), owner:profiles!tasks_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .eq("company_id", companyId)
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
    .select(
      `${taskSelect}, company:companies(id, name), deal:deals(id, title), owner:profiles!tasks_owner_id_fkey(id, email, full_name, display_name)`,
    )
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
