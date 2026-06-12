import { redirect } from "next/navigation";
import { login } from "@/app/(auth)/login/actions";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "E-Mail oder Passwort ist nicht korrekt.",
  missing_fields: "Bitte E-Mail und Passwort ausfuellen.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;
  const next = params.next ?? "/dashboard";

  return (
    <main className="grid min-h-dvh bg-neutral-50 px-4 py-8 text-neutral-950 lg:grid-cols-[1fr_480px] lg:p-0">
      <section className="hidden flex-col justify-between border-r border-neutral-200 bg-white p-10 lg:flex">
        <div>
          <p className="text-sm font-medium text-neutral-500">tagtig Internal CRM</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-normal text-neutral-950">
            Recruiting- und SaaS-Pipeline konzentriert verwalten.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-neutral-600">
          Unternehmen, Ansprechpartner, Deals, Aktivitäten und Follow-ups an
          einem geschützten Ort.
        </p>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-medium text-neutral-500">tagtig Internal CRM</p>
            <h1 className="mt-3 text-2xl font-semibold text-neutral-950">
              Anmeldung
            </h1>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-950">Einloggen</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Melde dich mit deinem Supabase-Auth-Konto an.
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form action={login} className="space-y-4">
              <input type="hidden" name="next" value={next} />

              <label className="block">
                <span className="text-sm font-medium text-neutral-700">E-Mail</span>
                <input
                  className="mt-1 block h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@unternehmen.de"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-neutral-700">Passwort</span>
                <input
                  className="mt-1 block h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Passwort"
                />
              </label>

              <button
                type="submit"
                className="h-10 w-full rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Einloggen
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
