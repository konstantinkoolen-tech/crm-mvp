import { InviteSetupForm } from "@/components/auth/invite-setup-form";

type InvitePageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { email } = await searchParams;
  const invitedEmail = email?.trim().toLowerCase() ?? "";

  return (
    <main className="grid min-h-dvh bg-neutral-50 px-4 py-8 text-neutral-950 lg:grid-cols-[1fr_480px] lg:p-0">
      <section className="hidden flex-col justify-between border-r border-neutral-200 bg-white p-10 lg:flex">
        <div>
          <p className="text-sm font-medium text-neutral-500">tagtig CRM</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-normal text-neutral-950">
            Willkommen im Team.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-600">
            Richte deinen geschützten Zugang ein und starte anschließend direkt im
            CRM.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <p className="text-sm font-medium text-neutral-500">tagtig CRM</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-950">
                Einladung abschließen
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Lege dein Passwort fest und bestätige deine E-Mail-Adresse.
              </p>
            </div>
            <InviteSetupForm invitedEmail={invitedEmail} />
          </div>
        </div>
      </section>
    </main>
  );
}
