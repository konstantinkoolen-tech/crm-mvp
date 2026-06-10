import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/crm/mobile-header";
import { Sidebar } from "@/components/crm/sidebar";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-950">
      <div className="flex min-h-dvh">
        <Sidebar userEmail={user.email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader userEmail={user.email} />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
