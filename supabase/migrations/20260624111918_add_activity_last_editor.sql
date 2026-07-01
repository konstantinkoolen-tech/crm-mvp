alter table public.activities
add column if not exists last_edited_by uuid references public.profiles(id) on delete set null;

create index if not exists activities_last_edited_by_idx
on public.activities(last_edited_by);

create or replace function app_private.set_activity_last_editor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.last_edited_by = coalesce((select auth.uid()), new.last_edited_by);
  return new;
end;
$$;

drop trigger if exists set_activity_last_editor on public.activities;
create trigger set_activity_last_editor
before update on public.activities
for each row execute function app_private.set_activity_last_editor();
