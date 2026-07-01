import type { TeamProfile } from "@/lib/db/profiles";
import { ownerDisplayName } from "@/lib/list-display";

type TaskOwnerSelectProps = {
  defaultOwnerId?: string | null;
  id: string;
  label?: string;
  name?: string;
  profiles: TeamProfile[];
};

export function TaskOwnerSelect({
  defaultOwnerId,
  id,
  label = "Zuständig",
  name = "owner_id",
  profiles,
}: TaskOwnerSelectProps) {
  const options = profileOptions(profiles, defaultOwnerId);

  if (options.length === 0) {
    return null;
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <select
        id={id}
        name={name}
        defaultValue={defaultOwnerId ?? options[0]?.id ?? ""}
        required
        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
      >
        {options.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {ownerDisplayName(profile)}
            {profile.status === "inactive" ? " (inaktiv)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function profileOptions(
  profiles: TeamProfile[],
  defaultOwnerId?: string | null,
) {
  const activeProfiles = profiles.filter((profile) => profile.status === "active");
  const selectedProfile = profiles.find((profile) => profile.id === defaultOwnerId);

  if (
    selectedProfile &&
    selectedProfile.status !== "active" &&
    !activeProfiles.some((profile) => profile.id === selectedProfile.id)
  ) {
    return [selectedProfile, ...activeProfiles];
  }

  return activeProfiles;
}
