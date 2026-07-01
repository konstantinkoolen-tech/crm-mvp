import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/crm/mobile-header";
import { Sidebar } from "@/components/crm/sidebar";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { todayDateString } from "@/lib/tasks/constants";

export default async function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(supabase, user);

  const { data: dueOrOverdueTasks, error: dueOrOverdueTasksError } = await supabase
    .from("tasks")
    .select("id")
    .in("status", ["open", "in_progress"])
    .lte("due_date", todayDateString())
    .limit(1);

  if (dueOrOverdueTasksError) {
    throw new Error(dueOrOverdueTasksError.message);
  }

  return (
    <div className="h-dvh overflow-hidden bg-neutral-50 text-neutral-950">
      <div className="flex h-full min-h-0">
        <Sidebar
          hasOverdueTasks={Boolean(dueOrOverdueTasks?.length)}
          userEmail={user.email}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileHeader userEmail={user.email} />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
