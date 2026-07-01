alter table public.deals
  drop constraint if exists deals_status_matches_stage;

alter table public.deals
  drop constraint if exists deals_status_valid;

alter table public.deals
  alter column status drop default;

alter table public.deals
  alter column status type text
  using case
    when status::text = 'archived' then 'open'
    else status::text
  end;

update public.deals
set status = 'open'
where status = 'archived';

alter table public.deals
  alter column status set default 'open';

alter table public.deals
  add constraint deals_status_valid check (
    status in ('open', 'won', 'lost', 'churn')
  );

alter table public.companies
  drop constraint if exists companies_status_valid;

alter table public.companies
  alter column status drop default;

alter table public.companies
  alter column status type text
  using case
    when status::text in ('new', 'contacted', 'in_exchange', 'active_customer', 'lost_customer', 'churn') then status::text
    else 'new'
  end;

alter table public.companies
  alter column status set default 'new';

create or replace function app_private.derive_company_status(p_company_id uuid)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when exists (
      select 1
      from public.deals
      where deals.company_id = p_company_id
        and deals.status = 'won'
    ) then 'active_customer'
    when exists (
      select 1
      from public.deals
      where deals.company_id = p_company_id
        and deals.status = 'churn'
    ) then 'churn'
    when exists (
      select 1
      from public.deals
      where deals.company_id = p_company_id
        and deals.status = 'lost'
    ) then 'lost_customer'
    when exists (
      select 1
      from public.activities
      where activities.company_id = p_company_id
        and activities.direction = 'inbound'
    ) then 'in_exchange'
    when exists (
      select 1
      from public.activities
      where activities.company_id = p_company_id
        and activities.direction = 'outbound'
    ) then 'contacted'
    else 'new'
  end;
$$;

create or replace function app_private.recalculate_company_status(p_company_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  next_status text;
begin
  if p_company_id is null then
    return;
  end if;

  next_status := app_private.derive_company_status(p_company_id);

  update public.companies
  set status = next_status,
      updated_at = now()
  where id = p_company_id
    and status is distinct from next_status;
end;
$$;

create or replace function app_private.sync_company_status_from_deals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform app_private.recalculate_company_status(old.company_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    perform app_private.recalculate_company_status(new.company_id);
  end if;

  return null;
end;
$$;

create or replace function app_private.sync_company_status_from_activities()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  old_company_id uuid;
  new_company_id uuid;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    old_company_id := old.company_id;

    if old_company_id is null and old.deal_id is not null then
      select deals.company_id
      into old_company_id
      from public.deals
      where deals.id = old.deal_id;
    end if;

    perform app_private.recalculate_company_status(old_company_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    new_company_id := new.company_id;

    if new_company_id is null and new.deal_id is not null then
      select deals.company_id
      into new_company_id
      from public.deals
      where deals.id = new.deal_id;
    end if;

    perform app_private.recalculate_company_status(new_company_id);
  end if;

  return null;
end;
$$;

drop trigger if exists deals_sync_company_status on public.deals;
create trigger deals_sync_company_status
after insert or update or delete on public.deals
for each row execute function app_private.sync_company_status_from_deals();

drop trigger if exists activities_sync_company_status on public.activities;
create trigger activities_sync_company_status
after insert or update or delete on public.activities
for each row execute function app_private.sync_company_status_from_activities();

update public.companies
set status = app_private.derive_company_status(companies.id);

alter table public.companies
  add constraint companies_status_valid check (
    status in (
      'new',
      'contacted',
      'in_exchange',
      'active_customer',
      'lost_customer',
      'churn'
    )
  );
