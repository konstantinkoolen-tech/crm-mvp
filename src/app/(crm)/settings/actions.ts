"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getCompanyClient } from "@/lib/db/companies";
import { requireAdminProfile } from "@/lib/db/value-props";

const VALUE_PROPS_PATH = "/value-props";

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

function settingsRedirect(message: string): never {
  redirect(`${VALUE_PROPS_PATH}?message=${encodeURIComponent(message)}`);
}

function settingsError(message: string): never {
  redirect(`${VALUE_PROPS_PATH}?error=${encodeURIComponent(message)}`);
}

async function ensureAdminOrRedirect() {
  try {
    await requireAdminProfile();
  } catch (error) {
    settingsError(
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
    settingsError("Code und Name der Value Prop sind Pflichtfelder.");
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
    settingsError(error.message);
  }

  revalidateValueProps();
  settingsRedirect("Value Prop wurde hinzugefuegt.");
}

export async function updateValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));
  const code = requiredText(formData.get("code"));
  const label = requiredText(formData.get("label"));

  if (!valuePropId || !code || !label) {
    settingsError("Value Prop, Code und Name sind Pflichtfelder.");
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
    settingsError(error.message);
  }

  revalidateValueProps();
  settingsRedirect("Value Prop wurde aktualisiert.");
}

export async function updateValuePropStatus(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));
  const status = requiredText(formData.get("status")) === "archived" ? "archived" : "active";

  if (!valuePropId) {
    settingsError("Value Prop fehlt.");
  }

  const { error } = await supabase
    .from("value_props")
    .update({ status })
    .eq("id", valuePropId);

  if (error) {
    settingsError(error.message);
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
    settingsError("Reihenfolge konnte nicht geändert werden.");
  }

  const { data, error } = await supabase
    .from("value_props")
    .select("id, sort_order")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    settingsError(error.message);
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
    settingsError(currentError.message);
  }

  const { error: targetError } = await supabase
    .from("value_props")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  if (targetError) {
    settingsError(targetError.message);
  }

  revalidateValueProps();
  redirect(VALUE_PROPS_PATH);
}

export async function deleteValueProp(formData: FormData) {
  await ensureAdminOrRedirect();
  const { supabase } = await getCompanyClient();
  const valuePropId = requiredText(formData.get("value_prop_id"));

  if (!valuePropId) {
    settingsError("Value Prop fehlt.");
  }

  const { error } = await supabase
    .from("value_props")
    .delete()
    .eq("id", valuePropId);

  if (error) {
    settingsError(error.message);
  }

  revalidateValueProps();
  settingsRedirect("Value Prop wurde gelöscht.");
}

export async function inviteUser(formData: FormData) {
  await ensureAdminOrRedirect();
  const email = requiredText(formData.get("email"));

  if (!email) {
    settingsError("Bitte gib eine E-Mail für die Einladung ein.");
  }

  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (error) {
    settingsError(
      error instanceof Error
        ? error.message
        : "Einladung ist noch nicht aktiviert.",
    );
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email);

  if (error) {
    settingsError(error.message);
  }

  settingsRedirect("Einladung wurde versendet.");
}

export async function sendPasswordRecovery(formData: FormData) {
  await ensureAdminOrRedirect();
  const email = requiredText(formData.get("email"));

  if (!email) {
    settingsError("Bitte gib eine E-Mail für den Passwort-Reset ein.");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    settingsError(error.message);
  }

  settingsRedirect("Passwort-Reset wurde versendet.");
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
