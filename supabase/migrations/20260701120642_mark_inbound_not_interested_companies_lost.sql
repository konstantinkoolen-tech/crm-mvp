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
        and activities.outreach_outcome = 'not_interested'
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

update public.companies
set status = app_private.derive_company_status(companies.id);
