drop policy if exists "Permitted members can create companies" on public.companies;

create policy "Permitted members can create companies"
on public.companies for insert
to authenticated
with check (
  (select app_private.has_permission('create_companies'))
  and exists (
    select 1
    from public.profiles
    where profiles.id = companies.owner_id
      and profiles.status = 'active'
  )
);
