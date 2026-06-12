import { updateTask } from "@/app/(crm)/tasks/actions";
import { TaskForm } from "@/components/crm/task-form";
import { listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";
import { displayNameForProfile, getCurrentProfile } from "@/lib/db/profiles";
import { getTask } from "@/lib/db/tasks";

type EditTaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditTaskPage({
  params,
  searchParams,
}: EditTaskPageProps) {
  const [{ taskId }, { error }, companies, deals, profile] = await Promise.all([
    params,
    searchParams,
    listCompanies(),
    listDeals(),
    getCurrentProfile(),
  ]);
  const task = await getTask(taskId);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Task bearbeiten</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Status, Fälligkeit und Kontext aktualisieren.
        </p>
      </div>
      <TaskForm
        action={updateTask}
        companies={companies}
        deals={deals}
        ownerName={displayNameForProfile(profile)}
        task={task}
        error={errorMessage(error)}
        submitLabel="Speichern"
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
