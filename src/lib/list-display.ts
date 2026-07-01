import type { ListOwner } from "@/lib/db/companies";

export function ownerDisplayName(owner: ListOwner | null | undefined) {
  return (
    owner?.display_name?.trim() ||
    owner?.full_name?.trim() ||
    owner?.email?.split("@")[0] ||
    "Nicht zugeordnet"
  );
}
