import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function IntegrationsSettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Integrationen</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Externe Systeme und Tools vorbereiten.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bereiche</CardTitle>
          <CardDescription>Platzhalter für spätere Integrationen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>Integration hinzufügen</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
