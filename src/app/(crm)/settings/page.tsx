import {
  createValueProp,
  deleteValueProp,
  inviteUser,
  sendPasswordRecovery,
  updateValueProp,
} from "@/app/(crm)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentProfile, listValuePropsForSettings } from "@/lib/db/value-props";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [{ error, message }, profile, valueProps] = await Promise.all([
    searchParams,
    getCurrentProfile(),
    listValuePropsForSettings(),
  ]);
  const isAdmin = profile.role === "admin" && profile.status === "active";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Value Props und administrative CRM-Grundlagen.
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
              Dein Profil hat aktuell keine Admin-Rechte fuer diese Einstellungen.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Value Props</CardTitle>
            <CardDescription>
              Diese Optionen erscheinen in Outreach-Aktivitaeten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form action={createValueProp} className="rounded-md border border-neutral-200 p-4">
              <div className="grid gap-3 md:grid-cols-[96px_1fr_120px]">
                <div className="space-y-2">
                  <Label htmlFor="new-value-prop-code">Code</Label>
                  <Input
                    id="new-value-prop-code"
                    name="code"
                    placeholder="E"
                    disabled={!isAdmin}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-value-prop-label">Name</Label>
                  <Input
                    id="new-value-prop-label"
                    name="label"
                    placeholder="Neue Value Prop"
                    disabled={!isAdmin}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-value-prop-order">Reihenfolge</Label>
                  <Input
                    id="new-value-prop-order"
                    name="sort_order"
                    type="number"
                    defaultValue="50"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Label htmlFor="new-value-prop-description">Beschreibung</Label>
                <Textarea
                  id="new-value-prop-description"
                  name="description"
                  rows={2}
                  placeholder="Optionaler Kontext fuer das Team"
                  disabled={!isAdmin}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="submit" disabled={!isAdmin}>
                  Value Prop hinzufuegen
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {valueProps.length === 0 ? (
                <div className="rounded-md border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">
                  Noch keine Value Props vorhanden.
                </div>
              ) : (
                valueProps.map((valueProp) => (
                  <form
                    key={valueProp.id}
                    action={updateValueProp}
                    className="rounded-md border border-neutral-200 p-4"
                  >
                    <input
                      type="hidden"
                      name="value_prop_id"
                      value={valueProp.id}
                    />
                    <div className="grid gap-3 md:grid-cols-[96px_1fr_130px_120px]">
                      <div className="space-y-2">
                        <Label htmlFor={`value-prop-code-${valueProp.id}`}>
                          Code
                        </Label>
                        <Input
                          id={`value-prop-code-${valueProp.id}`}
                          name="code"
                          defaultValue={valueProp.code}
                          disabled={!isAdmin}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-prop-label-${valueProp.id}`}>
                          Name
                        </Label>
                        <Input
                          id={`value-prop-label-${valueProp.id}`}
                          name="label"
                          defaultValue={valueProp.label}
                          disabled={!isAdmin}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-prop-status-${valueProp.id}`}>
                          Status
                        </Label>
                        <select
                          id={`value-prop-status-${valueProp.id}`}
                          name="status"
                          defaultValue={valueProp.status}
                          disabled={!isAdmin}
                          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="active">Aktiv</option>
                          <option value="archived">Archiviert</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-prop-order-${valueProp.id}`}>
                          Reihenfolge
                        </Label>
                        <Input
                          id={`value-prop-order-${valueProp.id}`}
                          name="sort_order"
                          type="number"
                          defaultValue={valueProp.sort_order}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`value-prop-description-${valueProp.id}`}>
                        Beschreibung
                      </Label>
                      <Textarea
                        id={`value-prop-description-${valueProp.id}`}
                        name="description"
                        rows={2}
                        defaultValue={valueProp.description ?? ""}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button type="submit" variant="outline" disabled={!isAdmin}>
                        Speichern
                      </Button>
                      <Button
                        formAction={deleteValueProp}
                        type="submit"
                        variant="destructive"
                        disabled={!isAdmin}
                      >
                        Loeschen
                      </Button>
                    </div>
                  </form>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User verwalten</CardTitle>
              <CardDescription>
                Einladung und Passwort-Reset fuer CRM-Nutzer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={inviteUser} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">User einladen</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="name@unternehmen.de"
                    disabled={!isAdmin}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!isAdmin}>
                  Einladung senden
                </Button>
              </form>

              <form action={sendPasswordRecovery} className="space-y-3 border-t border-neutral-200 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Passwort resetten</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="name@unternehmen.de"
                    disabled={!isAdmin}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" disabled={!isAdmin}>
                  Reset-Link senden
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Freigaben und Ansichten</CardTitle>
              <CardDescription>
                Rollen- und Ansichtssteuerung fuer den naechsten Schritt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500">
                Vorbereitet fuer Admin-only Rechte. Die konkrete Verteilung von
                Ansichten bauen wir, sobald die Rollenlogik feststeht.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
