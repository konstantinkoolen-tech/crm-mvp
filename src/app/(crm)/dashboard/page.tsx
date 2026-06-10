import { AlertCircle, Building2, Handshake, ListTodo } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { TaskActions } from "@/components/crm/task-actions";
import { TaskStatusBadge } from "@/components/crm/task-status-badge";
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
import { listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";
import { isTaskOverdue, listOpenTasks } from "@/lib/db/tasks";

export default function DashboardPage() {
  const dataPromise = Promise.all([
    listOpenTasks(),
    listDeals(),
    listCompanies(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Offene Follow-ups und Pipeline-Ueberblick fuer das CRM-MVP.
        </p>
      </div>

      <DashboardContent dataPromise={dataPromise} />
    </section>
  );
}

async function DashboardContent({
  dataPromise,
}: {
  dataPromise: Promise<
    [
      Awaited<ReturnType<typeof listOpenTasks>>,
      Awaited<ReturnType<typeof listDeals>>,
      Awaited<ReturnType<typeof listCompanies>>,
    ]
  >;
}) {
  const [openTasks, deals, companies] = await dataPromise;
  const overdueTasks = openTasks.filter(isTaskOverdue);
  const activeDeals = deals.filter((deal) => deal.status === "open");

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          href="/tasks"
          icon={<ListTodo className="size-5 text-neutral-500" aria-hidden="true" />}
          label="Offene Tasks"
          value={openTasks.length}
        />
        <MetricCard
          href="/dashboard"
          icon={<AlertCircle className="size-5 text-red-500" aria-hidden="true" />}
          label="Ueberfaellig"
          value={overdueTasks.length}
          tone="danger"
        />
        <MetricCard
          href="/deals"
          icon={<Handshake className="size-5 text-neutral-500" aria-hidden="true" />}
          label="Aktive Deals"
          value={activeDeals.length}
        />
        <MetricCard
          href="/companies"
          icon={<Building2 className="size-5 text-neutral-500" aria-hidden="true" />}
          label="Unternehmen"
          value={companies.length}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ueberfaellige Tasks</CardTitle>
          <CardDescription>
            Offene Follow-ups mit Faelligkeitsdatum vor heute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-neutral-200 py-10 text-center">
              <p className="text-sm font-medium text-neutral-950">
                Keine ueberfaelligen Tasks
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Alles im gruenen Bereich.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Kontext</TableHead>
                  <TableHead>Faellig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="font-medium text-neutral-950 hover:underline"
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {task.company ? (
                        <Link
                          href={`/companies/${task.company.id}`}
                          className="hover:underline"
                        >
                          {task.company.name}
                        </Link>
                      ) : task.deal ? (
                        <Link
                          href={`/deals/${task.deal.id}`}
                          className="hover:underline"
                        >
                          {task.deal.title}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{task.due_date ? formatDate(task.due_date) : "-"}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </>
  );
}

function MetricCard({
  href,
  icon,
  label,
  tone,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone?: "danger";
  value: number;
}) {
  return (
    <Link href={href}>
      <Card className={tone === "danger" ? "border-red-200 bg-red-50" : undefined}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className={tone === "danger" ? "text-sm text-red-700" : "text-sm text-neutral-500"}>
              {label}
            </p>
            {icon}
          </div>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
