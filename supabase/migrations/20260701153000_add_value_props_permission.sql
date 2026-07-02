alter table public.profiles
  add column if not exists can_manage_value_props boolean not null default false;

update public.profiles
set can_manage_value_props = true
where role = 'admin';

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
        when 'manage_value_props' then profiles.can_manage_value_props
        else false
      end
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.status = 'active'
    ),
    false
  );
$$;

revoke all on function app_private.has_permission(text) from public;
grant execute on function app_private.has_permission(text) to authenticated;

drop policy if exists "Users can read active value props" on public.value_props;
drop policy if exists "Active members can read value props" on public.value_props;
drop policy if exists "Admins can create value props" on public.value_props;
drop policy if exists "Admins can update own value props" on public.value_props;
drop policy if exists "Admins can update value props" on public.value_props;
drop policy if exists "Admins can delete own value props" on public.value_props;
drop policy if exists "Admins can delete value props" on public.value_props;

create policy "Active members can read value props"
on public.value_props for select
to authenticated
using (
  (select app_private.is_active_member())
  and (
    status = 'active'
    or (select app_private.has_permission('manage_value_props'))
  )
);

create policy "Permitted members can create value props"
on public.value_props for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (select app_private.has_permission('manage_value_props'))
);

create policy "Permitted members can update value props"
on public.value_props for update
to authenticated
using ((select app_private.has_permission('manage_value_props')))
with check ((select app_private.has_permission('manage_value_props')));

create policy "Permitted members can delete value props"
on public.value_props for delete
to authenticated
using ((select app_private.has_permission('manage_value_props')));
