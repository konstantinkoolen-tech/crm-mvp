alter table public.event_associations
add column if not exists last_edited_by uuid references public.profiles(id) on delete set null;

create index if not exists event_associations_last_edited_by_idx
on public.event_associations(last_edited_by);

create or replace function app_private.set_event_association_last_editor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.last_edited_by = coalesce((select auth.uid()), new.last_edited_by);
  return new;
end;
$$;

drop trigger if exists set_event_association_last_editor on public.event_associations;
create trigger set_event_association_last_editor
before update on public.event_associations
for each row execute function app_private.set_event_association_last_editor();
