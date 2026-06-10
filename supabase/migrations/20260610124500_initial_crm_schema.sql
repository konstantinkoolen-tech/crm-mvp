create extension if not exists pgcrypto;

create type public.profile_status as enum (
  'active',
  'inactive'
);

create type public.company_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.contact_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.deal_stage as enum (
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create type public.deal_status as enum (
  'open',
  'won',
  'lost',
  'archived'
);

create type public.activity_type as enum (
  'note',
  'linkedin_message',
  'call',
  'email',
  'meeting',
  'task_update'
);

create type public.activity_status as enum (
  'planned',
  'completed',
  'canceled'
);

create type public.task_status as enum (
  'open',
  'in_progress',
  'done',
  'canceled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  name text not null,
  website text,
  industry text,
  employee_count integer,
  status public.company_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_employee_count_non_negative check (
    employee_count is null or employee_count >= 0
  )
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  linkedin_url text,
  status public.contact_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  stage public.deal_stage not null default 'lead',
  status public.deal_status not null default 'open',
  value_amount numeric(12, 2),
  value_currency char(3) not null default 'EUR',
  probability integer,
  expected_close_date date,
  closed_at timestamptz,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_value_amount_non_negative check (
    value_amount is null or value_amount >= 0
  ),
  constraint deals_probability_percent check (
    probability is null or probability between 0 and 100
  ),
  constraint deals_status_matches_stage check (
    (stage = 'won' and status = 'won')
    or (stage = 'lost' and status = 'lost')
    or (stage not in ('won', 'lost') and status in ('open', 'archived'))
  )
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete cascade,
  type public.activity_type not null default 'note',
  status public.activity_status not null default 'completed',
  title text not null,
  body text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_has_context check (
    company_id is not null or contact_id is not null or deal_id is not null
  )
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'open',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_done_requires_completed_at check (
    status <> 'done' or completed_at is not null
  )
);

create index profiles_email_idx on public.profiles(lower(email)) where email is not null;
create index companies_owner_name_idx on public.companies(owner_id, lower(name));
create index companies_owner_status_idx on public.companies(owner_id, status);
create index contacts_owner_company_idx on public.contacts(owner_id, company_id);
create index contacts_owner_email_idx on public.contacts(owner_id, lower(email)) where email is not null;
create index contacts_owner_status_idx on public.contacts(owner_id, status);
create index deals_owner_stage_idx on public.deals(owner_id, stage);
create index deals_owner_status_idx on public.deals(owner_id, status);
create index deals_owner_company_idx on public.deals(owner_id, company_id);
create index deals_owner_expected_close_idx on public.deals(owner_id, expected_close_date);
create index activities_owner_company_idx on public.activities(owner_id, company_id);
create index activities_owner_contact_idx on public.activities(owner_id, contact_id);
create index activities_owner_deal_idx on public.activities(owner_id, deal_id);
create index activities_owner_occurred_idx on public.activities(owner_id, occurred_at desc);
create index tasks_owner_status_due_idx on public.tasks(owner_id, status, due_date);
create index tasks_owner_company_idx on public.tasks(owner_id, company_id);
create index tasks_owner_contact_idx on public.tasks(owner_id, contact_id);
create index tasks_owner_deal_idx on public.tasks(owner_id, deal_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger set_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger set_deals_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

create trigger set_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can read own companies"
on public.companies for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own companies"
on public.companies for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update own companies"
on public.companies for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete own companies"
on public.companies for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own contacts"
on public.contacts for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own contacts"
on public.contacts for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.companies
    where companies.id = contacts.company_id
      and companies.owner_id = auth.uid()
  )
);

create policy "Users can update own contacts"
on public.contacts for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.companies
    where companies.id = contacts.company_id
      and companies.owner_id = auth.uid()
  )
);

create policy "Users can delete own contacts"
on public.contacts for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own deals"
on public.deals for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own deals"
on public.deals for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.companies
    where companies.id = deals.company_id
      and companies.owner_id = auth.uid()
  )
  and (
    primary_contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = deals.primary_contact_id
        and contacts.owner_id = auth.uid()
        and contacts.company_id = deals.company_id
    )
  )
);

create policy "Users can update own deals"
on public.deals for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.companies
    where companies.id = deals.company_id
      and companies.owner_id = auth.uid()
  )
  and (
    primary_contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = deals.primary_contact_id
        and contacts.owner_id = auth.uid()
        and contacts.company_id = deals.company_id
    )
  )
);

create policy "Users can delete own deals"
on public.deals for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own activities"
on public.activities for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own activities"
on public.activities for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.id = activities.company_id
        and companies.owner_id = auth.uid()
    )
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = activities.contact_id
        and contacts.owner_id = auth.uid()
    )
  )
  and (
    deal_id is null
    or exists (
      select 1
      from public.deals
      where deals.id = activities.deal_id
        and deals.owner_id = auth.uid()
    )
  )
);

create policy "Users can update own activities"
on public.activities for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.id = activities.company_id
        and companies.owner_id = auth.uid()
    )
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = activities.contact_id
        and contacts.owner_id = auth.uid()
    )
  )
  and (
    deal_id is null
    or exists (
      select 1
      from public.deals
      where deals.id = activities.deal_id
        and deals.owner_id = auth.uid()
    )
  )
);

create policy "Users can delete own activities"
on public.activities for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own tasks"
on public.tasks for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own tasks"
on public.tasks for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.id = tasks.company_id
        and companies.owner_id = auth.uid()
    )
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = tasks.contact_id
        and contacts.owner_id = auth.uid()
    )
  )
  and (
    deal_id is null
    or exists (
      select 1
      from public.deals
      where deals.id = tasks.deal_id
        and deals.owner_id = auth.uid()
    )
  )
);

create policy "Users can update own tasks"
on public.tasks for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and (
    company_id is null
    or exists (
      select 1
      from public.companies
      where companies.id = tasks.company_id
        and companies.owner_id = auth.uid()
    )
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = tasks.contact_id
        and contacts.owner_id = auth.uid()
    )
  )
  and (
    deal_id is null
    or exists (
      select 1
      from public.deals
      where deals.id = tasks.deal_id
        and deals.owner_id = auth.uid()
    )
  )
);

create policy "Users can delete own tasks"
on public.tasks for delete
to authenticated
using (owner_id = auth.uid());
