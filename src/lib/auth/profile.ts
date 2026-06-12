import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function ensureProfile(
  supabase: SupabaseServerClient,
  user: User,
) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    return;
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const email = user.email ?? null;
  const isInitialAdmin = email?.toLowerCase() === "k.koolen@tagtig.de";

  await supabase.from("profiles").insert({
    id: user.id,
    email,
    full_name: fullName,
    display_name: fullName ?? email?.split("@")[0] ?? null,
    role: isInitialAdmin ? "admin" : "member",
    can_create_deals: true,
    can_create_companies: true,
    can_delete_companies: isInitialAdmin,
    can_manage_users: isInitialAdmin,
    can_manage_settings: isInitialAdmin,
  });
}
