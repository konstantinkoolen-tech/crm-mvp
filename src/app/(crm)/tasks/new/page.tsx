import { createTask } from "@/app/(crm)/tasks/actions";
import { TaskForm } from "@/components/crm/task-form";
import { getCompanyClient, listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";

type NewTaskPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const [{ error }, companies, deals, { user }] = await Promise.all([
    searchParams,
    listCompanies(),
    listDeals(),
    getCompanyClient(),
  ]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Task erstellen</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Lege ein Follow-up mit Fälligkeitsdatum an.
        </p>
      </div>
      <TaskForm
        action={createTask}
        companies={companies}
        deals={deals}
        ownerEmail={user.email}
        error={errorMessage(error)}
        submitLabel="Erstellen"
      />
    </section>
  );
}

function errorMessage(error?: string) {
  if (!error) {
    return undefined;
  }

  if (error === "missing_title") {
    return "Bitte gib einen Task-Titel ein.";
  }

  if (error === "missing_due_date") {
    return "Bitte wähle ein Fälligkeitsdatum.";
  }

  return decodeURIComponent(error);
}
