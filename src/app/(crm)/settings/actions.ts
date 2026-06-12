"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getCompanyClient } from "@/lib/db/companies";
import { requireAdminProfile } from "@/lib/db/profiles";

const VALUE_PROPS_PATH = "/value-props";
const USERS_PATH = "/settings/users";

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableText(value: FormDataEntryValue | null) {
  const text = requiredText(value);
  return text.length > 0 ? text : null;
}

function intFromForm(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function settingsRedirect(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function settingsError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function ensureAdminOrRedirect(path = VALUE_PROPS_PATH) {
  try {
    await requireAdminProfile();
  } catch (error) {
    settingsError(
      path,
      error instanceof Error
        ? error.message
        : "Nur Admins können diese Einstellung ändern.",
    );
  }
}

export async function createValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase, user } = await getCompanyClient();
  const code = requiredText(formData.get("code"));
  const label = requiredText(formData.get("label"));

  if (!code || !label) {
    settingsError(VALUE_PROPS_PATH, "Code und Name der Value Prop sind Pflichtfelder.");
  }

  const { error } = await supabase.from("value_props").insert({
    owner_id: user.id,
    code,
    label,
    description: nullableText(formData.get("description")),
    sort_order: intFromForm(formData.get("sort_order")),
    status: "active",
  });

  if (error) {
    settingsError(VALUE_PROPS_PATH, error.message);
  }

  revalidateValueProps();
  settingsRedirect(VALUE_PROPS_PATH, "Value Prop wurde hinzugefügt.");
}

export async function updateValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));
  const code = requiredText(formData.get("code"));
  const label = requiredText(formData.get("label"));

  if (!valuePropId || !code || !label) {
    settingsError(VALUE_PROPS_PATH, "Value Prop, Code und Name sind Pflichtfelder.");
  }

  const { error } = await supabase
    .from("value_props")
    .update({
      code,
      label,
      description: nullableText(formData.get("description")),
      sort_order: intFromForm(formData.get("sort_order")),
      status: requiredText(formData.get("status")) === "archived" ? "archived" : "active",
    })
    .eq("id", valuePropId);

  if (error) {
    settingsError(VALUE_PROPS_PATH, error.message);
  }

  revalidateValueProps();
  settingsRedirect(VALUE_PROPS_PATH, "Value Prop wurde aktualisiert.");
}

export async function updateValuePropStatus(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));
  const status = requiredText(formData.get("status")) === "archived" ? "archived" : "active";

  if (!valuePropId) {
    settingsError(VALUE_PROPS_PATH, "Value Prop fehlt.");
  }

  const { error } = await supabase
    .from("value_props")
    .update({ status })
    .eq("id", valuePropId);

  if (error) {
    settingsError(VALUE_PROPS_PATH, error.message);
  }

  revalidateValueProps();
  redirect(VALUE_PROPS_PATH);
}

export async function moveValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase, user } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));
  const direction = requiredText(formData.get("direction"));

  if (!valuePropId || (direction !== "up" && direction !== "down")) {
    settingsError(VALUE_PROPS_PATH, "Reihenfolge konnte nicht geändert werden.");
  }

  const { data, error } = await supabase
    .from("value_props")
    .select("id, sort_order")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    settingsError(VALUE_PROPS_PATH, error.message);
  }

  const currentIndex = (data ?? []).findIndex((valueProp) => valueProp.id === valuePropId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const current = data?.[currentIndex];
  const target = data?.[targetIndex];

  if (!current || !target) {
    redirect(VALUE_PROPS_PATH);
  }

  const { error: currentError } = await supabase
    .from("value_props")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);

  if (currentError) {
    settingsError(VALUE_PROPS_PATH, currentError.message);
  }

  const { error: targetError } = await supabase
    .from("value_props")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  if (targetError) {
    settingsError(VALUE_PROPS_PATH, targetError.message);
  }

  revalidateValueProps();
  redirect(VALUE_PROPS_PATH);
}

export async function deleteValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));

  if (!valuePropId) {
    settingsError(VALUE_PROPS_PATH, "Value Prop fehlt.");
  }

  const { error } = await supabase
    .from("value_props")
    .delete()
    .eq("id", valuePropId);

  if (error) {
    settingsError(VALUE_PROPS_PATH, error.message);
  }

  revalidateValueProps();
  settingsRedirect(VALUE_PROPS_PATH, "Value Prop wurde gelöscht.");
}

export async function inviteUser(formData: FormData) {
  await ensureAdminOrRedirect(USERS_PATH);
  const email = requiredText(formData.get("email"));

  if (!email) {
    settingsError(USERS_PATH, "Bitte gib eine E-Mail für die Einladung ein.");
  }

  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (error) {
    settingsError(
      USERS_PATH,
      error instanceof Error
        ? error.message
        : "Einladung ist noch nicht aktiviert.",
    );
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email);

  if (error) {
    settingsError(USERS_PATH, error.message);
  }

  settingsRedirect(USERS_PATH, "Einladung wurde versendet.");
}

export async function sendPasswordRecovery(formData: FormData) {
  await ensureAdminOrRedirect(USERS_PATH);
  const email = requiredText(formData.get("email"));

  if (!email) {
    settingsError(USERS_PATH, "Bitte gib eine E-Mail für den Passwort-Reset ein.");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    settingsError(USERS_PATH, error.message);
  }

  settingsRedirect(USERS_PATH, "Passwort-Reset wurde versendet.");
}

export async function updateUserProfile(formData: FormData) {
  await ensureAdminOrRedirect(USERS_PATH);
  const { supabase } = await getCompanyClient();
  const profileId = requiredText(formData.get("profile_id"));
  const displayName = requiredText(formData.get("display_name"));
  const role = requiredText(formData.get("role")) === "admin" ? "admin" : "member";
  const status = requiredText(formData.get("status")) === "inactive" ? "inactive" : "active";

  if (!profileId || !displayName) {
    settingsError(USERS_PATH, "Profil und Anzeigename sind Pflichtfelder.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      role,
      status,
      can_create_deals: formData.get("can_create_deals") === "on",
      can_create_companies: formData.get("can_create_companies") === "on",
      can_delete_companies: formData.get("can_delete_companies") === "on",
      can_manage_users: formData.get("can_manage_users") === "on",
      can_manage_settings: formData.get("can_manage_settings") === "on",
    })
    .eq("id", profileId);

  if (error) {
    settingsError(USERS_PATH, error.message);
  }

  revalidatePath(USERS_PATH);
  settingsRedirect(USERS_PATH, "User wurde aktualisiert.");
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY fehlt in den Server-Umgebungsvariablen. Einladung ist vorbereitet, aber noch nicht aktiviert.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function revalidateValueProps() {
  revalidatePath("/settings");
  revalidatePath(VALUE_PROPS_PATH);
  revalidatePath("/companies/[companyId]", "page");
}
