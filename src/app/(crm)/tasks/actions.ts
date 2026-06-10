"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import { taskStatuses } from "@/lib/db/tasks";
import type { TaskStatus } from "@/types/database";

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function statusFromForm(value: FormDataEntryValue | null): TaskStatus {
  const status = String(value ?? "open");
  return taskStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "open";
}

function completedAtFor(status: TaskStatus) {
  return status === "done" ? new Date().toISOString() : null;
}

function taskPayload(formData: FormData, ownerId: string) {
  const status = statusFromForm(formData.get("status"));

  return {
    owner_id: ownerId,
    company_id: nullableText(formData.get("company_id")),
    deal_id: nullableText(formData.get("deal_id")),
    title: requiredText(formData.get("title")),
    description: nullableText(formData.get("description")),
    due_date: nullableText(formData.get("due_date")),
    status,
    completed_at: completedAtFor(status),
  };
}

export async function createTask(formData: FormData) {
  const { supabase, user } = await getCompanyClient();
  const payload = taskPayload(formData, user.id);

  if (!payload.title) {
    redirect("/tasks/new?error=missing_title");
  }

  if (!payload.due_date) {
    redirect("/tasks/new?error=missing_due_date");
  }

  const { error } = await supabase.from("tasks").insert(payload);

  if (error) {
    redirect(`/tasks/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (payload.company_id) {
    revalidatePath(`/companies/${payload.company_id}`);
  }
  if (payload.deal_id) {
    revalidatePath(`/deals/${payload.deal_id}`);
  }

  redirect("/tasks");
}

export async function updateTask(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const { supabase, user } = await getCompanyClient();
  const payload = taskPayload(formData, user.id);

  if (!taskId) {
    redirect("/tasks?error=missing_task");
  }

  if (!payload.title) {
    redirect(`/tasks/${taskId}/edit?error=missing_title`);
  }

  if (!payload.due_date) {
    redirect(`/tasks/${taskId}/edit?error=missing_due_date`);
  }

  const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);

  if (error) {
    redirect(`/tasks/${taskId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (payload.company_id) {
    revalidatePath(`/companies/${payload.company_id}`);
  }
  if (payload.deal_id) {
    revalidatePath(`/deals/${payload.deal_id}`);
  }

  redirect("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const status = statusFromForm(formData.get("status"));

  if (!taskId) {
    redirect("/tasks?error=missing_task");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: completedAtFor(status),
    })
    .eq("id", taskId);

  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));

  if (!taskId) {
    redirect("/tasks?error=missing_task");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
