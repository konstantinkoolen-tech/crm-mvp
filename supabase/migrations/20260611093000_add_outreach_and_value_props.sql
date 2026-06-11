create table if not exists public.value_props (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  code text not null,
  label text not null,
  description text,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint value_props_status_check check (status in ('active', 'archived')),
  constraint value_props_code_not_empty check (length(trim(code)) > 0),
  constraint value_props_label_not_empty check (length(trim(label)) > 0)
);

alter table public.activities
add column if not exists outreach_kind text,
add column if not exists outreach_outcome text,
add column if not exists pain_statement text not null default 'no_statement',
add column if not exists value_prop_id uuid references public.value_props(id) on delete set null;

alter table public.activities
drop constraint if exists activities_outreach_kind_check,
add constraint activities_outreach_kind_check
check (
  outreach_kind is null
  or outreach_kind in ('snowflake', 'fire', 'fire_plus')
);

alter table public.activities
drop constraint if exists activities_outreach_outcome_check,
add constraint activities_outreach_outcome_check
check (
  outreach_outcome is null
  or outreach_outcome in (
    'no_response',
    'wrong_number',
    'gatekeeper',
    'no_time',
    'not_interested',
    'interested',
    'follow_up_booked'
  )
);

alter table public.activities
drop constraint if exists activities_pain_statement_check,
add constraint activities_pain_statement_check
check (pain_statement in ('no_statement', 'pain_not_identified', 'pain_identified'));

alter table public.activities
drop constraint if exists activities_outreach_fields_check,
add constraint activities_outreach_fields_check
check (
  (
    outreach_kind is null
    and outreach_outcome is null
    and value_prop_id is null
  )
  or (
    outreach_kind is not null
    and outreach_outcome is not null
    and value_prop_id is not null
  )
);

create index if not exists value_props_owner_status_idx
on public.value_props(owner_id, status, sort_order);

create index if not exists activities_value_prop_idx
on public.activities(value_prop_id);

drop trigger if exists set_value_props_updated_at on public.value_props;
create trigger set_value_props_updated_at
before update on public.value_props
for each row
execute function public.set_updated_at();

alter table public.value_props enable row level security;

drop policy if exists "Users can read active value props" on public.value_props;
create policy "Users can read active value props"
on public.value_props for select
to authenticated
using (status = 'active' or owner_id = auth.uid());

drop policy if exists "Admins can create value props" on public.value_props;
create policy "Admins can create value props"
on public.value_props for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
);

drop policy if exists "Admins can update own value props" on public.value_props;
create policy "Admins can update own value props"
on public.value_props for update
to authenticated
using (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
)
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
);

drop policy if exists "Admins can delete own value props" on public.value_props;
create policy "Admins can delete own value props"
on public.value_props for delete
to authenticated
using (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
);

insert into public.value_props (owner_id, code, label, sort_order)
select
  profiles.id,
  seed.code,
  seed.label,
  seed.sort_order
from public.profiles
cross join (
  values
    ('A', 'Feedbackloop', 10),
    ('B', 'Kein Nachfassen', 20),
    ('C', 'ATS/VMS connection', 30),
    ('D', 'Reporting', 40)
) as seed(code, label, sort_order)
where profiles.id = '2fade747-c5e7-41a7-ad3f-370c8b8685d1'
  and not exists (
    select 1
    from public.value_props
    where value_props.owner_id = profiles.id
      and value_props.code = seed.code
  );

update public.profiles
set role = 'admin'
where id = '2fade747-c5e7-41a7-ad3f-370c8b8685d1';
