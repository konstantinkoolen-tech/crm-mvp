import { notFound } from "next/navigation";
import { getCompanyClient, type ListOwner } from "@/lib/db/companies";
import type { ContactStatus } from "@/types/database";

export type Contact = {
  id: string;
  owner_id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  linkedin_url: string | null;
  status: ContactStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactWithCompany = Contact & {
  company: {
    id: string;
    name: string;
  } | null;
  event_associations: {
    id: string;
    event_id: string;
    event_date_id: string | null;
    event: {
      id: string;
      name: string;
      focus: string | null;
    } | null;
    event_date: {
      id: string;
      event_date: string;
    } | null;
  }[];
  owner: ListOwner | null;
};

const contactSelect =
  "id, owner_id, company_id, first_name, last_name, email, phone, job_title, linkedin_url, status, notes, created_at, updated_at";

export async function listContactsForCompany(companyId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(contactSelect)
    .eq("company_id", companyId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Contact[];
}

export async function listContacts() {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(
      `${contactSelect}, company:companies(id, name), event_associations(id, event_id, event_date_id, event:events(id, name, focus), event_date:event_dates(id, event_date)), owner:profiles!contacts_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ContactWithCompany[];
}

export async function getContact(contactId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(
      `${contactSelect}, company:companies(id, name), event_associations(id, event_id, event_date_id, event:events(id, name, focus), event_date:event_dates(id, event_date)), owner:profiles!contacts_owner_id_fkey(id, email, full_name, display_name)`,
    )
    .eq("id", contactId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as unknown as ContactWithCompany;
}
