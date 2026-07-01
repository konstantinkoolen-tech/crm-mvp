alter table public.activities
drop constraint if exists activities_outreach_fields_check;

update public.activities
set outreach_kind = null
where direction = 'inbound'
  and outreach_kind is not null;

alter table public.activities
add constraint activities_outreach_fields_check
check (
  (
    direction = 'inbound'
    and outreach_kind is null
    and (
      (
        outreach_outcome is null
        and value_prop_id is null
        and pain_statement = 'no_statement'
      )
      or (
        outreach_outcome is not null
        and value_prop_id is not null
      )
    )
  )
  or (
    direction = 'outbound'
    and (
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
            type = 'call'
            and outreach_outcome is not null
          )
          or (
            type <> 'call'
            and outreach_outcome is null
            and pain_statement = 'no_statement'
          )
        )
      )
    )
  )
);
