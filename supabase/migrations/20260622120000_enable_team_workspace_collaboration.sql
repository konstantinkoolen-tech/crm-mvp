create schema if not exists app_private;

create or replace function app_private.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.status = 'active'
  );
$$;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
      and profiles.status = 'active'
  );
$$;

create or replace function app_private.has_permission(permission_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select case permission_name
        when 'create_companies' then profiles.can_create_companies
        when 'delete_companies' then profiles.can_delete_companies
        when 'create_deals' then profiles.can_create_deals
        when 'manage_users' then profiles.can_manage_users
        when 'manage_settings' then profiles.can_manage_settings
        else false
      end
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.status = 'active'
    ),
    false
  );
$$;

revoke all on function app_private.is_active_member() from public;
revoke all on function app_private.is_admin() from public;
revoke all on function app_private.has_permission(text) from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_active_member() to authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.has_permission(text) to authenticated;

drop policy if exists "Active members can read team profiles" on public.profiles;
create policy "Active members can read team profiles"
on public.profiles for select
to authenticated
using ((select app_private.is_active_member()));

drop policy if exists "Users can read own companies" on public.companies;
drop policy if exists "Users can create own companies" on public.companies;
drop policy if exists "Users can update own companies" on public.companies;
drop policy if exists "Users can delete own companies" on public.companies;

create policy "Active members can read companies"
on public.companies for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Permitted members can create companies"
on public.companies for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.has_permission('create_companies'))
);

create policy "Active members can update companies"
on public.companies for update
to authenticated
using ((select app_private.is_active_member()))
with check ((select app_private.is_active_member()));

create policy "Permitted members can delete companies"
on public.companies for delete
to authenticated
using ((select app_private.has_permission('delete_companies')));

drop policy if exists "Users can read own contacts" on public.contacts;
drop policy if exists "Users can create own contacts" on public.contacts;
drop policy if exists "Users can update own contacts" on public.contacts;
drop policy if exists "Users can delete own contacts" on public.contacts;

create policy "Active members can read contacts"
on public.contacts for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create contacts"
on public.contacts for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.is_active_member())
  and exists (
    select 1 from public.companies where companies.id = contacts.company_id
  )
);

create policy "Active members can update contacts"
on public.contacts for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and exists (
    select 1 from public.companies where companies.id = contacts.company_id
  )
);

create policy "Active members can delete contacts"
on public.contacts for delete
to authenticated
using ((select app_private.is_active_member()));

drop policy if exists "Users can read own deals" on public.deals;
drop policy if exists "Users can create own deals" on public.deals;
drop policy if exists "Users can update own deals" on public.deals;
drop policy if exists "Users can delete own deals" on public.deals;

create policy "Active members can read deals"
on public.deals for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Permitted members can create deals"
on public.deals for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.has_permission('create_deals'))
  and exists (
    select 1 from public.companies where companies.id = deals.company_id
  )
  and (
    primary_contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = deals.primary_contact_id
        and contacts.company_id = deals.company_id
    )
  )
);

create policy "Active members can update deals"
on public.deals for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and exists (
    select 1 from public.companies where companies.id = deals.company_id
  )
  and (
    primary_contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = deals.primary_contact_id
        and contacts.company_id = deals.company_id
    )
  )
);

create policy "Active members can delete deals"
on public.deals for delete
to authenticated
using ((select app_private.is_active_member()));

drop policy if exists "Users can read own activities" on public.activities;
drop policy if exists "Users can create own activities" on public.activities;
drop policy if exists "Users can update own activities" on public.activities;
drop policy if exists "Users can delete own activities" on public.activities;

create policy "Active members can read activities"
on public.activities for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create activities"
on public.activities for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.is_active_member())
  and (
    company_id is null
    or exists (
      select 1 from public.companies where companies.id = activities.company_id
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts where contacts.id = activities.contact_id
    )
  )
  and (
    deal_id is null
    or exists (
      select 1 from public.deals where deals.id = activities.deal_id
    )
  )
);

create policy "Active members can update activities"
on public.activities for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and (
    company_id is null
    or exists (
      select 1 from public.companies where companies.id = activities.company_id
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts where contacts.id = activities.contact_id
    )
  )
  and (
    deal_id is null
    or exists (
      select 1 from public.deals where deals.id = activities.deal_id
    )
  )
);

create policy "Active members can delete activities"
on public.activities for delete
to authenticated
using ((select app_private.is_active_member()));

drop policy if exists "Users can read own tasks" on public.tasks;
drop policy if exists "Users can create own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Active members can read tasks"
on public.tasks for select
to authenticated
using ((select app_private.is_active_member()));

create policy "Active members can create tasks"
on public.tasks for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.is_active_member())
  and (
    company_id is null
    or exists (
      select 1 from public.companies where companies.id = tasks.company_id
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts where contacts.id = tasks.contact_id
    )
  )
  and (
    deal_id is null
    or exists (
      select 1 from public.deals where deals.id = tasks.deal_id
    )
  )
);

create policy "Active members can update tasks"
on public.tasks for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and (
    company_id is null
    or exists (
      select 1 from public.companies where companies.id = tasks.company_id
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts where contacts.id = tasks.contact_id
    )
  )
  and (
    deal_id is null
    or exists (
      select 1 from public.deals where deals.id = tasks.deal_id
    )
  )
);

create policy "Active members can delete tasks"
on public.tasks for delete
to authenticated
using ((select app_private.is_active_member()));

drop policy if exists "Users can read active value props" on public.value_props;
drop policy if exists "Admins can create value props" on public.value_props;
drop policy if exists "Admins can update own value props" on public.value_props;
drop policy if exists "Admins can delete own value props" on public.value_props;

create policy "Active members can read value props"
on public.value_props for select
to authenticated
using (
  (select app_private.is_active_member())
  and (status = 'active' or (select app_private.is_admin()))
);

create policy "Admins can create value props"
on public.value_props for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.is_admin())
);

create policy "Admins can update value props"
on public.value_props for update
to authenticated
using ((select app_private.is_admin()))
with check ((select app_private.is_admin()));

create policy "Admins can delete value props"
on public.value_props for delete
to authenticated
using ((select app_private.is_admin()));
