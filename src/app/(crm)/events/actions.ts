"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
import type { EventDateFormRow } from "@/types/database";

function nullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function eventFields(formData: FormData) {
  return {
    name: requiredText(formData.get("name")),
    website: nullableText(formData.get("website")),
    location: nullableText(formData.get("location")),
    participant_count: nullableInteger(formData.get("participant_count")),
    focus: nullableText(formData.get("focus")),
    internal_notes: nullableText(formData.get("internal_notes")),
    price: nullableText(formData.get("price")),
    access: nullableText(formData.get("access")),
  };
}

function eventDateRows(formData: FormData): EventDateFormRow[] {
  const ids = formData.getAll("event_date_id[]");
  const dates = formData.getAll("event_date[]");
  const ownerIds = formData.getAll("event_date_owner_id[]");
  const rowCount = Math.max(ids.length, dates.length, ownerIds.length);
  const rows: EventDateFormRow[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const eventDate = normalizeDate(dates[index] ?? null);

    if (!eventDate) {
      continue;
    }

    rows.push({
      id: nullableText(ids[index] ?? null) ?? undefined,
      event_date: eventDate,
      internal_owner_id: nullableText(ownerIds[index] ?? null),
    });
  }

  return rows;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }

  return text;
}

function eventReturnTo(eventId: string) {
  return `/events/${eventId}`;
}

async function syncEventDates(
  supabase: Awaited<ReturnType<typeof getCompanyClient>>["supabase"],
  eventId: string,
  rows: EventDateFormRow[],
) {
  const { data: existingDates, error: existingError } = await supabase
    .from("event_dates")
    .select("id")
    .eq("event_id", eventId);

  if (existingError) {
    return existingError;
  }

  const existingIds = new Set((existingDates ?? []).map((row) => row.id));
  const submittedIds = new Set(rows.flatMap((row) => (row.id ? [row.id] : [])));
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));

  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from("event_dates")
      .delete()
      .eq("event_id", eventId)
      .in("id", idsToDelete);

    if (error) {
      return error;
    }
  }

  for (const row of rows) {
    if (row.id && existingIds.has(row.id)) {
      const { error } = await supabase
        .from("event_dates")
        .update({
          event_date: row.event_date,
          internal_owner_id: row.internal_owner_id,
        })
        .eq("event_id", eventId)
        .eq("id", row.id);

      if (error) {
        return error;
      }
      continue;
    }

    const { error } = await supabase.from("event_dates").insert({
      event_id: eventId,
      event_date: row.event_date,
      internal_owner_id: row.internal_owner_id,
    });

    if (error) {
      return error;
    }
  }

  return null;
}

function associationFields(formData: FormData) {
  return {
    event_id: requiredText(formData.get("event_id")),
    event_date_id: nullableText(formData.get("event_date_id")),
    company_id: requiredText(formData.get("company_id")),
    contact_id: nullableText(formData.get("contact_id")),
    notes: nullableText(formData.get("association_notes")),
  };
}

async function insertEventAssociation(formData: FormData) {
  const { supabase } = await getCompanyClient();
  const fields = associationFields(formData);

  if (!fields.event_id || !fields.company_id) {
    return {
      eventId: fields.event_id,
      companyId: fields.company_id,
      error: "missing_event_association",
    };
  }

  const { error } = await supabase.from("event_associations").insert(fields);

  return {
    eventId: fields.event_id,
    companyId: fields.company_id,
    error: error?.message,
  };
}

function revalidateEventPaths(eventId?: string | null, companyId?: string | null) {
  revalidatePath("/events");
  revalidatePath("/companies");
  revalidatePath("/contacts");

  if (eventId) {
    revalidatePath(eventReturnTo(eventId));
  }

  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await getCompanyClient();
  const payload = { ...eventFields(formData), owner_id: user.id };
  const dates = eventDateRows(formData);

  if (!payload.name) {
    redirect("/events?error=missing_event_name");
  }

  if (dates.length === 0) {
    redirect("/events?error=missing_event_date");
  }

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/events?error=${encodeURIComponent(error.message)}`);
  }

  const dateError = await syncEventDates(supabase, data.id, dates);

  if (dateError) {
    redirect(`/events/${data.id}?error=${encodeURIComponent(dateError.message)}`);
  }

  revalidateEventPaths(data.id);
  redirect(eventReturnTo(data.id));
}

export async function updateEvent(formData: FormData) {
  const eventId = requiredText(formData.get("event_id"));
  const { supabase } = await getCompanyClient();
  const payload = eventFields(formData);
  const dates = eventDateRows(formData);

  if (!eventId) {
    redirect("/events?error=missing_event");
  }

  if (!payload.name) {
    redirect(`${eventReturnTo(eventId)}?error=missing_event_name`);
  }

  if (dates.length === 0) {
    redirect(`${eventReturnTo(eventId)}?error=missing_event_date`);
  }

  const { error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (error) {
    redirect(`${eventReturnTo(eventId)}?error=${encodeURIComponent(error.message)}`);
  }

  const dateError = await syncEventDates(supabase, eventId, dates);

  if (dateError) {
    redirect(`${eventReturnTo(eventId)}?error=${encodeURIComponent(dateError.message)}`);
  }

  revalidateEventPaths(eventId);
  redirect(eventReturnTo(eventId));
}

export async function deleteEvent(formData: FormData) {
  const eventId = requiredText(formData.get("event_id"));

  if (!eventId) {
    redirect("/events?error=missing_event");
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    redirect(`${eventReturnTo(eventId)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateEventPaths(eventId);
  redirect("/events");
}

export async function createCompanyForEvent(formData: FormData) {
  const eventId = requiredText(formData.get("event_id"));
  const eventDateId = nullableText(formData.get("event_date_id"));
  const { supabase, user } = await getCompanyClient();
  const payload = {
    owner_id: nullableText(formData.get("owner_id")) ?? user.id,
    name: requiredText(formData.get("company_name")),
    website: nullableText(formData.get("website")),
    company_email: nullableText(formData.get("company_email")),
    phone: nullableText(formData.get("phone")),
    industry: nullableText(formData.get("industry")),
    notes: nullableText(formData.get("notes")),
  };

  if (!eventId) {
    redirect("/events?error=missing_event");
  }

  if (!payload.name) {
    redirect(`${eventReturnTo(eventId)}?error=missing_company_name`);
  }

  const { data, error } = await supabase
    .from("companies")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`${eventReturnTo(eventId)}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: associationError } = await supabase
    .from("event_associations")
    .insert({
      event_id: eventId,
      event_date_id: eventDateId,
      company_id: data.id,
      notes: nullableText(formData.get("association_notes")),
    });

  if (associationError) {
    redirect(
      `${eventReturnTo(eventId)}?error=${encodeURIComponent(
        associationError.message,
      )}`,
    );
  }

  revalidateEventPaths(eventId, data.id);
  redirect(eventReturnTo(eventId));
}

export async function createContactForEvent(formData: FormData) {
  const eventId = requiredText(formData.get("event_id"));
  const eventDateId = nullableText(formData.get("event_date_id"));
  const companyId = requiredText(formData.get("company_id"));
  const { supabase, user } = await getCompanyClient();
  const payload = {
    owner_id: user.id,
    company_id: companyId,
    first_name: requiredText(formData.get("first_name")),
    last_name: requiredText(formData.get("last_name")),
    email: nullableText(formData.get("email")),
    phone: nullableText(formData.get("phone")),
    job_title: nullableText(formData.get("job_title")),
    linkedin_url: nullableText(formData.get("linkedin_url")),
    notes: nullableText(formData.get("notes")),
  };

  if (!eventId) {
    redirect("/events?error=missing_event");
  }

  if (!companyId) {
    redirect(`${eventReturnTo(eventId)}?error=missing_company`);
  }

  if (!payload.first_name || !payload.last_name) {
    redirect(`${eventReturnTo(eventId)}?error=missing_contact_name`);
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`${eventReturnTo(eventId)}?error=${encodeURIComponent(error.message)}`);
  }

  const { error: associationError } = await supabase
    .from("event_associations")
    .insert({
      event_id: eventId,
      event_date_id: eventDateId,
      company_id: companyId,
      contact_id: data.id,
      notes: nullableText(formData.get("association_notes")),
    });

  if (associationError) {
    redirect(
      `${eventReturnTo(eventId)}?error=${encodeURIComponent(
        associationError.message,
      )}`,
    );
  }

  revalidateEventPaths(eventId, companyId);
  redirect(eventReturnTo(eventId));
}

export async function createEventAssociation(formData: FormData) {
  const returnTo = requiredText(formData.get("return_to")) || "/events";
  const result = await insertEventAssociation(formData);

  if (result.error) {
    redirect(`${returnTo}?error=${encodeURIComponent(result.error)}`);
  }

  revalidateEventPaths(result.eventId, result.companyId);
  redirect(returnTo);
}

export async function updateEventAssociation(formData: FormData) {
  const associationId = requiredText(formData.get("association_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/events";
  const fields = associationFields(formData);

  if (!associationId) {
    redirect(`${returnTo}?error=missing_event_association`);
  }

  if (!fields.event_id || !fields.company_id) {
    redirect(`${returnTo}?error=missing_event_association`);
  }

  const { supabase, user } = await getCompanyClient();
  const { error } = await supabase
    .from("event_associations")
    .update({
      ...fields,
      last_edited_by: user.id,
    })
    .eq("id", associationId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateEventPaths(fields.event_id, fields.company_id);
  redirect(returnTo);
}

export async function deleteEventAssociation(formData: FormData) {
  const associationId = requiredText(formData.get("association_id"));
  const eventId = requiredText(formData.get("event_id"));
  const companyId = nullableText(formData.get("company_id"));
  const returnTo = requiredText(formData.get("return_to")) || "/events";

  if (!associationId) {
    redirect(returnTo);
  }

  const { supabase } = await getCompanyClient();
  const { error } = await supabase
    .from("event_associations")
    .delete()
    .eq("id", associationId);

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateEventPaths(eventId, companyId);
  redirect(returnTo);
}
