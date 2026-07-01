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
      where (
          activities.company_id = p_company_id
          or exists (
            select 1
            from public.deals
            where deals.id = activities.deal_id
              and deals.company_id = p_company_id
          )
          or exists (
            select 1
            from public.contacts
            where contacts.id = activities.contact_id
              and contacts.company_id = p_company_id
          )
        )
        and activities.direction = 'inbound'
    ) then 'in_exchange'
    when exists (
      select 1
      from public.activities
      where (
          activities.company_id = p_company_id
          or exists (
            select 1
            from public.deals
            where deals.id = activities.deal_id
              and deals.company_id = p_company_id
          )
          or exists (
            select 1
            from public.contacts
            where contacts.id = activities.contact_id
              and contacts.company_id = p_company_id
          )
        )
        and activities.direction = 'outbound'
    ) then 'contacted'
    else 'new'
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

    if old_company_id is null and old.contact_id is not null then
      select contacts.company_id
      into old_company_id
      from public.contacts
      where contacts.id = old.contact_id;
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

    if new_company_id is null and new.contact_id is not null then
      select contacts.company_id
      into new_company_id
      from public.contacts
      where contacts.id = new.contact_id;
    end if;

    perform app_private.recalculate_company_status(new_company_id);
  end if;

  return null;
end;
$$;

update public.companies
set status = app_private.derive_company_status(companies.id);
