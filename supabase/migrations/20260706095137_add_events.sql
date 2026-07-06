create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  name text not null,
  website text,
  location text,
  participant_count integer,
  focus text,
  internal_notes text,
  price text,
  access text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_participant_count_non_negative check (
    participant_count is null or participant_count >= 0
  )
);

create table if not exists public.event_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_date date not null,
  internal_owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_associations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_date_id uuid references public.event_dates(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_owner_name_idx
  on public.events(owner_id, lower(name));
create index if not exists events_owner_updated_idx
  on public.events(owner_id, updated_at desc);
create index if not exists event_dates_event_date_idx
  on public.event_dates(event_id, event_date);
create index if not exists event_dates_internal_owner_idx
  on public.event_dates(internal_owner_id);
create index if not exists event_associations_event_idx
  on public.event_associations(event_id);
create index if not exists event_associations_event_date_idx
  on public.event_associations(event_date_id);
create index if not exists event_associations_company_idx
  on public.event_associations(company_id);
create index if not exists event_associations_contact_idx
  on public.event_associations(contact_id)
  where contact_id is not null;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists set_event_dates_updated_at on public.event_dates;
create trigger set_event_dates_updated_at
before update on public.event_dates
for each row execute function public.set_updated_at();

drop trigger if exists set_event_associations_updated_at on public.event_associations;
create trigger set_event_associations_updated_at
before update on public.event_associations
for each row execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.event_dates enable row level security;
alter table public.event_associations enable row level security;

grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.event_dates to authenticated;
grant select, insert, update, delete on table public.event_associations to authenticated;

create policy "Active members can read events"
on public.events for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create events"
on public.events for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.is_active_member())
);

create policy "Active members can update events"
on public.events for update
to authenticated
using ((select app_private.is_active_member()))
with check ((select app_private.is_active_member()));

create policy "Active members can delete events"
on public.events for delete
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can read event dates"
on public.event_dates for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create event dates"
on public.event_dates for insert
to authenticated
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.events
    where events.id = event_dates.event_id
  )
  and (
    internal_owner_id is null
    or exists (
      select 1
      from public.profiles
      where profiles.id = event_dates.internal_owner_id
        and profiles.status = 'active'
    )
  )
);

create policy "Active members can update event dates"
on public.event_dates for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.events
    where events.id = event_dates.event_id
  )
  and (
    internal_owner_id is null
    or exists (
      select 1
      from public.profiles
      where profiles.id = event_dates.internal_owner_id
        and profiles.status = 'active'
    )
  )
);

create policy "Active members can delete event dates"
on public.event_dates for delete
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can read event associations"
on public.event_associations for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create event associations"
on public.event_associations for insert
to authenticated
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.events
    where events.id = event_associations.event_id
  )
  and exists (
    select 1
    from public.companies
    where companies.id = event_associations.company_id
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = event_associations.contact_id
        and contacts.company_id = event_associations.company_id
    )
  )
  and (
    event_date_id is null
    or exists (
      select 1
      from public.event_dates
      where event_dates.id = event_associations.event_date_id
        and event_dates.event_id = event_associations.event_id
    )
  )
);

create policy "Active members can update event associations"
on public.event_associations for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.events
    where events.id = event_associations.event_id
  )
  and exists (
    select 1
    from public.companies
    where companies.id = event_associations.company_id
  )
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = event_associations.contact_id
        and contacts.company_id = event_associations.company_id
    )
  )
  and (
    event_date_id is null
    or exists (
      select 1
      from public.event_dates
      where event_dates.id = event_associations.event_date_id
        and event_dates.event_id = event_associations.event_id
    )
  )
);

create policy "Active members can delete event associations"
on public.event_associations for delete
to authenticated
using ((select app_private.is_active_member()));
