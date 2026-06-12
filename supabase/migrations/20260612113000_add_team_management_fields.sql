create schema if not exists app_private;

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists can_create_deals boolean not null default true,
  add column if not exists can_create_companies boolean not null default true,
  add column if not exists can_delete_companies boolean not null default false,
  add column if not exists can_manage_users boolean not null default false,
  add column if not exists can_manage_settings boolean not null default false;

update public.profiles
set display_name = coalesce(
  nullif(display_name, ''),
  nullif(full_name, ''),
  split_part(email, '@', 1)
)
where display_name is null or display_name = '';

update public.profiles
set
  role = 'admin',
  status = 'active',
  can_create_deals = true,
  can_create_companies = true,
  can_delete_companies = true,
  can_manage_users = true,
  can_manage_settings = true
where lower(email) = 'k.koolen@tagtig.de';

create or replace function app_private.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  );
$$;

revoke all on function app_private.is_admin() from public;
grant execute on function app_private.is_admin() to authenticated;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (app_private.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());
