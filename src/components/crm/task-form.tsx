import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Company } from "@/lib/db/companies";
import type { DealWithCompany } from "@/lib/db/deals";
import { taskStatusLabels, taskStatuses, type TaskWithContext } from "@/lib/db/tasks";

type TaskFormProps = {
  action: (formData: FormData) => Promise<void>;
  companies: Company[];
  deals: DealWithCompany[];
  ownerEmail?: string | null;
  task?: TaskWithContext;
  error?: string;
  submitLabel: string;
};

export function TaskForm({
  action,
  companies,
  deals,
  ownerEmail,
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
          {ownerEmail ? ` (${ownerEmail})` : ""}.
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
              <Textarea
                id="description"
                name="description"
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
