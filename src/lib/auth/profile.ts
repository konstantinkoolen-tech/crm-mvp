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

  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
  });
}
