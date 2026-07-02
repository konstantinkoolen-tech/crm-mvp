import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { TaskOwnerSelect } from "@/components/crm/task-owner-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import type { Company } from "@/lib/db/companies";
import type { DealWithCompany } from "@/lib/db/deals";
import type { TeamProfile } from "@/lib/db/profiles";
import type { TaskWithContext } from "@/lib/db/tasks";
import { taskStatusLabels, taskStatuses } from "@/lib/tasks/constants";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";

type TaskFormProps = {
  action: (formData: FormData) => Promise<void>;
  companies: Company[];
  deals: DealWithCompany[];
  defaultOwnerId?: string | null;
  ownerName?: string | null;
  profiles: TeamProfile[];
  task?: TaskWithContext;
  error?: string;
  submitLabel: string;
};

export function TaskForm({
  action,
  companies,
  deals,
  defaultOwnerId,
  ownerName,
  profiles,
  task,
  error,
  submitLabel,
}: TaskFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? "Task bearbeiten" : "Task erstellen"}</CardTitle>
        <CardDescription>
          Zuständig ist der angemeldete Nutzer
          {ownerName ? ` (${ownerName})` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action={action} className="space-y-5">
          {task ? <input type="hidden" name="task_id" value={task.id} /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={TASK_TITLE_MAX_LENGTH}
                defaultValue={task?.title ?? ""}
                placeholder="Follow-up senden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fälligkeit</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                defaultValue={task?.due_date ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={task?.status ?? "open"}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <TaskOwnerSelect
              id="owner_id"
              defaultOwnerId={task?.owner_id ?? defaultOwnerId}
              profiles={profiles}
            />

            <div className="space-y-2">
              <Label htmlFor="company_id">Unternehmen</Label>
              <select
                id="company_id"
                name="company_id"
                defaultValue={task?.company_id ?? ""}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="">Kein Unternehmen</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal_id">Deal</Label>
              <select
                id="deal_id"
                name="deal_id"
                defaultValue={task?.deal_id ?? ""}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              >
                <option value="">Kein Deal</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <RichTextTextarea
                id="description"
                name="description"
                maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                rows={6}
                defaultValue={task?.description ?? ""}
                placeholder="Kontext oder nächster Schritt"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/tasks" className={buttonVariants({ variant: "outline" })}>
              Abbrechen
            </Link>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
