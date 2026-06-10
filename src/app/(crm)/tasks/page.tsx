import { Plus } from "lucide-react";
import Link from "next/link";
import { TaskList } from "@/components/crm/task-list";
import { buttonVariants } from "@/components/ui/button";
import { getCompanyClient } from "@/lib/db/companies";
import { listTasks } from "@/lib/db/tasks";

type TasksPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const dataPromise = Promise.all([listTasks(), getCompanyClient()]);
  const { error } = await searchParams;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Tasks</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Follow-ups mit Faelligkeitsdatum, Status und zustaendigem Nutzer.
          </p>
        </div>
        <Link href="/tasks/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Task
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage(error)}
        </div>
      ) : null}

      <Tasks dataPromise={dataPromise} />
    </section>
  );
}

async function Tasks({
  dataPromise,
}: {
  dataPromise: Promise<
    [Awaited<ReturnType<typeof listTasks>>, Awaited<ReturnType<typeof getCompanyClient>>]
  >;
}) {
  const [tasks, { user }] = await dataPromise;

  return <TaskList ownerEmail={user.email} tasks={tasks} />;
}

function errorMessage(error: string) {
  if (error === "missing_task") {
    return "Der Task konnte nicht gefunden werden.";
  }

  return decodeURIComponent(error);
}
