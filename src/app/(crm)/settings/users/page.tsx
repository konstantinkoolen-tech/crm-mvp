import { MailPlus, RotateCcw, ShieldCheck } from "lucide-react";
import { inviteUser, sendPasswordRecovery, updateUserProfile } from "@/app/(crm)/settings/actions";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  displayNameForProfile,
  getCurrentProfile,
  listTeamProfiles,
} from "@/lib/db/profiles";
import { UserDeleteButton } from "@/components/crm/user-delete-button";
import { AssociatedFormSubmitButton } from "@/components/crm/associated-form-submit-button";

type UsersSettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const permissionFields = [
  {
    name: "can_create_deals",
    label: "Kann Deals erstellen",
  },
  {
    name: "can_create_companies",
    label: "Kann Unternehmen anlegen",
  },
  {
    name: "can_delete_companies",
    label: "Kann Unternehmen löschen",
  },
  {
    name: "can_manage_users",
    label: "Kann andere User hinzufügen",
  },
  {
    name: "can_manage_settings",
    label: "Kann Einstellungen verwalten",
  },
] as const;

export default async function UsersSettingsPage({
  searchParams,
}: UsersSettingsPageProps) {
  const [{ error, message }, currentProfile, profiles] = await Promise.all([
    searchParams,
    getCurrentProfile(),
    listTeamProfiles(),
  ]);
  const isAdmin = currentProfile.role === "admin" && currentProfile.status === "active";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">User Verwaltung</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Teammitglieder, Anzeigenamen, Rollen und Berechtigungen verwalten.
        </p>
      </div>

      {message ? <Feedback tone="success" message={message} /> : null}
      {error ? <Feedback tone="danger" message={error} /> : null}

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin-Zugriff erforderlich</CardTitle>
            <CardDescription>
              Nur Admins können User einladen, Passwörter zurücksetzen und Rechte ändern.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Neuen User hinzufügen</CardTitle>
            <CardDescription>
              Versendet eine Supabase-Einladung an die angegebene E-Mail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={inviteUser} className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-Mail</Label>
                <Input
                  disabled={!isAdmin}
                  id="invite-email"
                  name="email"
                  placeholder="name@unternehmen.de"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rolle</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                  defaultValue="member"
                  disabled={!isAdmin}
                  id="invite-role"
                  name="role"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button className="self-end" disabled={!isAdmin} type="submit">
                <MailPlus aria-hidden="true" />
                Einladung senden
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Sendet dem User eine E-Mail zum Setzen eines neuen Passworts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={sendPasswordRecovery} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="reset-email">E-Mail</Label>
                <Input
                  disabled={!isAdmin}
                  id="reset-email"
                  name="email"
                  placeholder="name@unternehmen.de"
                  type="email"
                />
              </div>
              <Button className="self-end" disabled={!isAdmin} type="submit" variant="outline">
                <RotateCcw aria-hidden="true" />
                Reset senden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>
            Der Anzeigename wird intern statt der E-Mail angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Berechtigungen</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="align-top">
                    <form action={updateUserProfile} id={`profile-${profile.id}`}>
                      <input name="profile_id" type="hidden" value={profile.id} />
                      <div className="space-y-2">
                        <Input
                          aria-label="Anzeigename"
                          defaultValue={displayNameForProfile(profile)}
                          disabled={!isAdmin}
                          name="display_name"
                        />
                        <div className="text-xs text-neutral-500">{profile.email}</div>
                        {profile.email?.toLowerCase() === "k.koolen@tagtig.de" ? (
                          <Badge className="gap-1" variant="default">
                            <ShieldCheck className="size-3" aria-hidden="true" />
                            Admin
                          </Badge>
                        ) : null}
                      </div>
                    </form>
                  </TableCell>
                  <TableCell className="align-top">
                    {profile.id === currentProfile.id ? (
                      <>
                        <input
                          form={`profile-${profile.id}`}
                          name="role"
                          type="hidden"
                          value="admin"
                        />
                        <Badge variant="secondary">Admin</Badge>
                      </>
                    ) : (
                      <select
                        className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                        defaultValue={profile.role === "admin" ? "admin" : "member"}
                        disabled={!isAdmin}
                        form={`profile-${profile.id}`}
                        name="role"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {profile.id === currentProfile.id ? (
                      <>
                        <input
                          form={`profile-${profile.id}`}
                          name="status"
                          type="hidden"
                          value="active"
                        />
                        <Badge variant="secondary">Aktiv</Badge>
                      </>
                    ) : (
                      <select
                        className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                        defaultValue={profile.status}
                        disabled={!isAdmin}
                        form={`profile-${profile.id}`}
                        name="status"
                      >
                        <option value="active">Aktiv</option>
                        <option value="inactive">Deaktiviert</option>
                      </select>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="grid gap-2">
                      {permissionFields.map((permission) => (
                        <label
                          className="flex items-center gap-2 text-sm text-neutral-700"
                          key={permission.name}
                        >
                          <input
                            className="size-4 rounded border-neutral-300"
                            defaultChecked={Boolean(profile[permission.name])}
                            disabled={!isAdmin}
                            form={`profile-${profile.id}`}
                            name={permission.name}
                            type="checkbox"
                          />
                          {permission.label}
                        </label>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <AssociatedFormSubmitButton
                        disabled={!isAdmin}
                        formId={`profile-${profile.id}`}
                      >
                        Speichern
                      </AssociatedFormSubmitButton>
                      {isAdmin && profile.id !== currentProfile.id ? (
                        <UserDeleteButton
                          profileId={profile.id}
                          userName={displayNameForProfile(profile)}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function Feedback({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "danger";
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      }
    >
      {decodeURIComponent(message)}
    </div>
  );
}
