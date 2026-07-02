"use client";

import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListFilterBar } from "@/components/crm/list-filter-bar";
import { RichTextDisplay } from "@/components/crm/rich-text-display";
import { TaskActions } from "@/components/crm/task-actions";
import { TaskStatusBadge } from "@/components/crm/task-status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskWithContext } from "@/lib/db/tasks";
import { ownerDisplayName } from "@/lib/list-display";
import { taskDueDateState, taskStatusLabels } from "@/lib/tasks/constants";
import { cn } from "@/lib/utils";

type TaskListProps = {
  tasks: TaskWithContext[];
};

type TaskSort = "due_asc" | "updated_desc" | "created_desc" | "title_asc";

export function TaskList({ tasks }: TaskListProps) {
  const [sort, setSort] = useState<TaskSort>("due_asc");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>();
    for (const task of tasks) {
      if (task.owner) {
        owners.set(task.owner.id, ownerDisplayName(task.owner));
      }
    }
    return Array.from(owners, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => owner === "all" || task.owner_id === owner)
      .filter((task) => status === "all" || task.status === status)
      .sort((a, b) => {
        if (status === "all") {
          const completedDelta = completedRank(a) - completedRank(b);

          if (completedDelta !== 0) {
            return completedDelta;
          }
        }

        if (sort === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        if (sort === "created_desc") {
          return dateValue(b.created_at) - dateValue(a.created_at);
        }
        if (sort === "updated_desc") {
          return dateValue(b.updated_at) - dateValue(a.updated_at);
        }
        return dueValue(a.due_date) - dueValue(b.due_date);
    });
  }, [owner, sort, status, tasks]);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-neutral-950">
            Noch keine Tasks
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Erstelle Follow-ups mit Fälligkeit und Status.
          </p>
          <Link href="/tasks/new" className={buttonVariants({ className: "mt-5" })}>
            <Plus aria-hidden="true" />
            Task erstellen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Tasks</CardTitle>
        <CardDescription>
          {visibleTasks.length} von {tasks.length} Einträgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ListFilterBar
          sortValue={sort}
          sortOptions={[
            { value: "due_asc", label: "Fälligkeit zuerst" },
            { value: "updated_desc", label: "Zuletzt aktualisiert" },
            { value: "created_desc", label: "Erstellt zuletzt" },
            { value: "title_asc", label: "Titel A-Z" },
          ]}
          onSortChange={(value) => setSort(value as TaskSort)}
          ownerValue={owner}
          ownerOptions={ownerOptions}
          onOwnerChange={setOwner}
          statusValue={status}
          statusOptions={Object.entries(taskStatusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          onStatusChange={setStatus}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Kontext</TableHead>
              <TableHead>Zuständig</TableHead>
              <TableHead>Fällig</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="whitespace-nowrap text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTasks.map((task) => {
              const isDone = task.status === "done";
              const companyHref = task.company_id
                ? `/companies/${task.company_id}`
                : null;

              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    isDone && "bg-neutral-50 text-neutral-400 hover:bg-neutral-50",
                  )}
                >
                  <TableCell>
                    {companyHref ? (
                      <Link
                        href={companyHref}
                        className={cn(
                          "font-medium hover:underline",
                          isDone ? "text-neutral-500" : "text-neutral-950",
                        )}
                      >
                        {task.title}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "font-medium",
                          isDone ? "text-neutral-500" : "text-neutral-950",
                        )}
                      >
                        {task.title}
                      </span>
                    )}
                    {task.description ? (
                      <RichTextDisplay
                        className={cn(
                          "mt-1 line-clamp-2 text-xs leading-5",
                          isDone ? "text-neutral-400" : "text-neutral-500",
                        )}
                        value={task.description}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <TaskContext task={task} muted={isDone} />
                  </TableCell>
                  <TableCell
                    className={isDone ? "text-neutral-400" : undefined}
                  >
                    {ownerDisplayName(task.owner)}
                  </TableCell>
                  <TableCell>
                    <TaskDueDate date={task.due_date} muted={isDone} />
                  </TableCell>
                  <TableCell>
                    <TaskStatusBadge
                      dueDate={task.due_date}
                      status={task.status}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <TaskActions taskId={task.id} status={task.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaskContext({
  muted,
  task,
}: {
  muted?: boolean;
  task: TaskWithContext;
}) {
  if (!task.company && !task.deal) {
    return (
      <span className={muted ? "text-neutral-400" : "text-neutral-500"}>
        -
      </span>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      {task.company ? (
        <Link
          href={`/companies/${task.company.id}`}
          className={cn(
            "block hover:underline",
            muted ? "text-neutral-400" : "text-neutral-950",
          )}
        >
          {task.company.name}
        </Link>
      ) : null}
      {task.deal ? (
        <Link
          href={`/deals/${task.deal.id}`}
          className={cn(
            "block hover:underline",
            muted ? "text-neutral-400" : "text-neutral-500",
          )}
        >
          {task.deal.title}
        </Link>
      ) : null}
    </div>
  );
}

const dueDateClasses = {
  past: "border-red-200 bg-red-50 text-red-700",
  today: "border-amber-200 bg-amber-50 text-amber-800",
  future: "border-green-200 bg-green-50 text-green-700",
} as const;

const dueDateLabels = {
  past: "Vergangenheit",
  today: "Heute",
  future: "Zukunft",
} as const;

function TaskDueDate({ date, muted }: { date: string | null; muted?: boolean }) {
  const state = taskDueDateState(date);

  if (!date || !state) {
    return (
      <span className={muted ? "text-neutral-400" : "text-neutral-500"}>
        -
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        muted
          ? "border-neutral-200 bg-neutral-100 text-neutral-500"
          : dueDateClasses[state],
      )}
      title={dueDateLabels[state]}
    >
      <CalendarDays className="size-3.5" aria-hidden="true" />
      {formatDate(date)}
    </span>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function dateValue(value: string) {
  return new Date(value).getTime();
}

function dueValue(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  return dateValue(value);
}

function completedRank(task: TaskWithContext) {
  return task.status === "done" ? 1 : 0;
}
