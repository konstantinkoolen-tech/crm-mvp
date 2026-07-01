alter table public.activities
add column if not exists direction text not null default 'outbound';

alter table public.activities
drop constraint if exists activities_direction_check,
add constraint activities_direction_check
check (direction in ('outbound', 'inbound'));

update public.activities
set
  outreach_outcome = null,
  pain_statement = 'no_statement'
where outreach_kind is not null
  and type <> 'call'
  and direction = 'outbound';

alter table public.activities
drop constraint if exists activities_outreach_fields_check,
add constraint activities_outreach_fields_check
check (
  (
    outreach_kind is null
    and outreach_outcome is null
    and value_prop_id is null
    and pain_statement = 'no_statement'
  )
  or (
    outreach_kind is not null
    and value_prop_id is not null
    and (
      (
        (type = 'call' or direction = 'inbound')
        and outreach_outcome is not null
      )
      or (
        type <> 'call'
        and direction = 'outbound'
        and outreach_outcome is null
        and pain_statement = 'no_statement'
      )
    )
  )
);

create index if not exists activities_owner_direction_idx
on public.activities(owner_id, direction, occurred_at desc);
