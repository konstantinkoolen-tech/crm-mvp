drop policy if exists "Active members can create tasks" on public.tasks;

create policy "Active members can create tasks"
on public.tasks for insert
to authenticated
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.profiles
    where profiles.id = tasks.owner_id
      and profiles.status = 'active'
  )
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

drop policy if exists "Active members can update tasks" on public.tasks;

create policy "Active members can update tasks"
on public.tasks for update
to authenticated
using ((select app_private.is_active_member()))
with check (
  (select app_private.is_active_member())
  and exists (
    select 1
    from public.profiles
    where profiles.id = tasks.owner_id
      and profiles.status = 'active'
  )
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

alter table public.tasks
drop constraint if exists tasks_title_length_check;

alter table public.tasks
add constraint tasks_title_length_check
check (char_length(title) <= 300)
not valid;

alter table public.tasks
drop constraint if exists tasks_description_length_check;

alter table public.tasks
add constraint tasks_description_length_check
check (description is null or char_length(description) <= 8000)
not valid;
