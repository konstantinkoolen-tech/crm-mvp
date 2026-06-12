import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OperationsSettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Operatives</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Operative CRM-Strukturen vorbereiten.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bereiche</CardTitle>
          <CardDescription>Platzhalter für spätere operative Einstellungen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>Deal-Pipelines</li>
            <li>Sequenzen</li>
            <li>Automationen</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
