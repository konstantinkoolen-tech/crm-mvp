import { ValuePropManager } from "@/components/crm/value-prop-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, listValuePropsForSettings } from "@/lib/db/value-props";

type ValuePropsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ValuePropsPage({
  searchParams,
}: ValuePropsPageProps) {
  const [{ error, message }, profile, valueProps] = await Promise.all([
    searchParams,
    getCurrentProfile(),
    listValuePropsForSettings(),
  ]);
  const isAdmin = profile.role === "admin" && profile.status === "active";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Value Props</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Outreach-Argumente verwalten und für Aktivitäten auswählbar machen.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {decodeURIComponent(message)}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin-Zugriff erforderlich</CardTitle>
            <CardDescription>
              Dein Profil hat aktuell keine Admin-Rechte für diese Einstellungen.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Auswahl der Props</CardTitle>
          <CardDescription>
            Eine Zeile pro Value Prop. Aufklappen zeigt die Erklärung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ValuePropManager valueProps={valueProps} isAdmin={isAdmin} />
        </CardContent>
      </Card>
    </section>
  );
}
