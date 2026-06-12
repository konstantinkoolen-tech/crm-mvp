import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { TaskActions } from "@/components/crm/task-actions";
import { TaskStatusBadge } from "@/components/crm/task-status-badge";
import { buttonVariants } from "@/components/ui/button";
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

type TaskListProps = {
  ownerEmail?: string | null;
  tasks: TaskWithContext[];
};

export function TaskList({ ownerEmail, tasks }: TaskListProps) {
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
        <CardDescription>{tasks.length} Einträge</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Kontext</TableHead>
              <TableHead>Zuständig</TableHead>
              <TableHead>Fällig</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="font-medium text-neutral-950 hover:underline"
                  >
                    {task.title}
                  </Link>
                  {task.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-neutral-500">
                      {task.description}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <TaskContext task={task} />
                </TableCell>
                <TableCell>{ownerEmail ?? "Aktueller Nutzer"}</TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-neutral-400" aria-hidden="true" />
                      {formatDate(task.due_date)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <TaskStatusBadge dueDate={task.due_date} status={task.status} />
                </TableCell>
                <TableCell>
                  <TaskActions taskId={task.id} status={task.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaskContext({ task }: { task: TaskWithContext }) {
  if (!task.company && !task.deal) {
    return <span className="text-neutral-500">-</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {task.company ? (
        <Link href={`/companies/${task.company.id}`} className="block hover:underline">
          {task.company.name}
        </Link>
      ) : null}
      {task.deal ? (
        <Link href={`/deals/${task.deal.id}`} className="block text-neutral-500 hover:underline">
          {task.deal.title}
        </Link>
      ) : null}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
