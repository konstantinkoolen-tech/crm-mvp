import { notFound } from "next/navigation";
import { getCompanyClient } from "@/lib/db/companies";
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
    .select(`${contactSelect}, company:companies(id, name)`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ContactWithCompany[];
}

export async function getContact(contactId: string) {
  const { supabase } = await getCompanyClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(`${contactSelect}, company:companies(id, name)`)
    .eq("id", contactId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return data as ContactWithCompany;
}
