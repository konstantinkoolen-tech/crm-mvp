import { createTask } from "@/app/(crm)/tasks/actions";
import { TaskForm } from "@/components/crm/task-form";
import { listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";
import {
  displayNameForProfile,
  getCurrentProfile,
  listTeamProfiles,
} from "@/lib/db/profiles";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/tasks/limits";

type NewTaskPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const [{ error }, companies, deals, profile, profiles] = await Promise.all([
    searchParams,
    listCompanies(),
    listDeals(),
    getCurrentProfile(),
    listTeamProfiles(),
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
        defaultOwnerId={profile.id}
        ownerName={displayNameForProfile(profile)}
        profiles={profiles}
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

  if (error === "title_too_long") {
    return `Der Task-Titel darf maximal ${TASK_TITLE_MAX_LENGTH} Zeichen lang sein.`;
  }

  if (error === "description_too_long") {
    return `Die Task-Beschreibung darf maximal ${TASK_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`;
  }

  return decodeURIComponent(error);
}
