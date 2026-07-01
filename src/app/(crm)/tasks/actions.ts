"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import { taskStatuses } from "@/lib/tasks/constants";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";
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

function ownerIdFromForm(
  formData: FormData,
  fallbackOwnerId: string,
  fieldName = "owner_id",
) {
  return nullableText(formData.get(fieldName)) ?? fallbackOwnerId;
}

function taskFields(formData: FormData) {
  const status = statusFromForm(formData.get("status"));

  return {
    company_id: nullableText(formData.get("company_id")),
    contact_id: nullableText(formData.get("contact_id")),
    deal_id: nullableText(formData.get("deal_id")),
    title: requiredText(formData.get("title")),
    description: nullableText(formData.get("description")),
    due_date: nullableText(formData.get("due_date")),
    status,
    completed_at: completedAtFor(status),
  };
}

function taskLengthError({
  description,
  title,
}: {
  description: string | null;
  title: string;
}) {
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    return "title_too_long";
  }

  if ((description?.length ?? 0) > TASK_DESCRIPTION_MAX_LENGTH) {
    return "description_too_long";
  }

  return null;
}

function followUpTaskLengthError({
  description,
  title,
}: {
  description: string | null;
  title: string;
}) {
  const error = taskLengthError({ description, title });

  if (error === "title_too_long") {
    return "task_title_too_long";
  }

  if (error === "description_too_long") {
    return "task_description_too_long";
  }

  return null;
}

export async function createTask(formData: FormData) {
  const returnTo = requiredText(formData.get("return_to"));
  const errorTo = returnTo || "/tasks/new";
  const successTo = returnTo || "/tasks";
  const { supabase, user } = await getCompanyClient();
  const payload = {
    ...taskFields(formData),
    owner_id: ownerIdFromForm(formData, user.id),
  };

  if (!payload.title) {
    redirect(`${errorTo}?error=missing_title`);
  }

  if (!payload.due_date) {
    redirect(`${errorTo}?error=missing_due_date`);
  }

  const lengthError = taskLengthError(payload);

  if (lengthError) {
    redirect(`${errorTo}?error=${lengthError}`);
  }

  const { error } = await supabase.from("tasks").insert(payload);

  if (error) {
    redirect(`${errorTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (payload.company_id) {
    revalidatePath(`/companies/${payload.company_id}`);
  }
  if (payload.deal_id) {
    revalidatePath(`/deals/${payload.deal_id}`);
  }

  redirect(successTo);
}

export async function updateTask(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const returnTo = requiredText(formData.get("return_to"));
  const errorTo = returnTo || `/tasks/${taskId}/edit`;
  const successTo = returnTo || "/tasks";
  const { supabase } = await getCompanyClient();
  const ownerId = nullableText(formData.get("owner_id"));
  const payload = ownerId
    ? { ...taskFields(formData), owner_id: ownerId }
    : taskFields(formData);

  if (!taskId) {
    redirect(`${successTo}?error=missing_task`);
  }

  if (!payload.title) {
    redirect(`${errorTo}?error=missing_title`);
  }

  if (!payload.due_date) {
    redirect(`${errorTo}?error=missing_due_date`);
  }

  const lengthError = taskLengthError(payload);

  if (lengthError) {
    redirect(`${errorTo}?error=${lengthError}`);
  }

  const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);

  if (error) {
    redirect(`${errorTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (payload.company_id) {
    revalidatePath(`/companies/${payload.company_id}`);
  }
  if (payload.deal_id) {
    revalidatePath(`/deals/${payload.deal_id}`);
  }

  redirect(successTo);
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

export async function updateTaskOwner(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const ownerId = requiredText(formData.get("owner_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/tasks";

  if (!taskId || !ownerId) {
    redirect(`${returnTo}?error=missing_task`);
  }

  const { supabase } = await getCompanyClient();
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("company_id, deal_id")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !task) {
    redirect(
      `${returnTo}?error=${encodeURIComponent(taskError?.message ?? "Task nicht gefunden.")}`,
    );
  }

  const { error } = await supabase
    .from("tasks")
    .update({ owner_id: ownerId })
    .eq("id", taskId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.company_id) {
    revalidatePath(`/companies/${task.company_id}`);
  }
  if (task.deal_id) {
    revalidatePath(`/deals/${task.deal_id}`);
  }

  redirect(returnTo);
}

export async function completeTaskWithOptionalFollowUp(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/tasks";
  const createFollowUp = formData.get("create_follow_up") === "on";
  const followUpTitle = requiredText(formData.get("follow_up_title"));
  const followUpDescription = nullableText(formData.get("follow_up_description"));
  const followUpDueDate = nullableText(formData.get("follow_up_due_date"));

  if (!taskId) {
    redirect(`${returnTo}?error=missing_task`);
  }

  if (createFollowUp && !followUpTitle) {
    redirect(`${returnTo}?error=missing_task_title`);
  }

  if (createFollowUp && !followUpDueDate) {
    redirect(`${returnTo}?error=missing_task_due_date`);
  }

  const lengthError = createFollowUp
    ? followUpTaskLengthError({
        description: followUpDescription,
        title: followUpTitle,
      })
    : null;

  if (lengthError) {
    redirect(`${returnTo}?error=${lengthError}`);
  }

  const { supabase, user } = await getCompanyClient();
  const { data: currentTask, error: taskError } = await supabase
    .from("tasks")
    .select(
      "id, owner_id, company_id, contact_id, deal_id, status, completed_at",
    )
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !currentTask) {
    redirect(
      `${returnTo}?error=${encodeURIComponent(taskError?.message ?? "Task nicht gefunden.")}`,
    );
  }

  const completedAt = new Date().toISOString();
  const { error: completionError } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: completedAt })
    .eq("id", taskId);

  if (completionError) {
    redirect(`${returnTo}?error=${encodeURIComponent(completionError.message)}`);
  }

  if (createFollowUp) {
    const { error: followUpError } = await supabase.from("tasks").insert({
      owner_id: ownerIdFromForm(
        formData,
        currentTask.owner_id ?? user.id,
        "follow_up_owner_id",
      ),
      company_id: currentTask.company_id,
      contact_id: currentTask.contact_id,
      deal_id: currentTask.deal_id,
      title: followUpTitle,
      description: followUpDescription,
      due_date: followUpDueDate,
      status: "open",
      completed_at: null,
    });

    if (followUpError) {
      await supabase
        .from("tasks")
        .update({
          status: currentTask.status,
          completed_at: currentTask.completed_at,
        })
        .eq("id", taskId);
      redirect(`${returnTo}?error=${encodeURIComponent(followUpError.message)}`);
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (currentTask.company_id) {
    revalidatePath(`/companies/${currentTask.company_id}`);
  }
  if (currentTask.deal_id) {
    revalidatePath(`/deals/${currentTask.deal_id}`);
  }

  redirect(returnTo);
}

export async function deleteTask(formData: FormData) {
  const taskId = requiredText(formData.get("task_id"));
  const companyId = nullableText(formData.get("company_id"));
  const dealId = nullableText(formData.get("deal_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/tasks";

  if (!taskId) {
    redirect(`${returnTo}?error=missing_task`);
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
  if (dealId) {
    revalidatePath(`/deals/${dealId}`);
  }
  redirect(returnTo);
}
