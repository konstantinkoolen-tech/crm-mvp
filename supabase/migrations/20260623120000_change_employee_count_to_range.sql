alter table public.companies
  drop constraint if exists companies_employee_count_non_negative;

alter table public.companies
  drop constraint if exists companies_employee_count_valid;

alter table public.companies
  alter column employee_count type text
  using case
    when employee_count is null then null
    when employee_count::text in ('1-5', '6-10', '11-20', '21-50', '50+') then employee_count::text
    when employee_count::text ~ '^[0-9]+$' and employee_count::integer <= 5 then '1-5'
    when employee_count::text ~ '^[0-9]+$' and employee_count::integer <= 10 then '6-10'
    when employee_count::text ~ '^[0-9]+$' and employee_count::integer <= 20 then '11-20'
    when employee_count::text ~ '^[0-9]+$' and employee_count::integer <= 50 then '21-50'
    when employee_count::text ~ '^[0-9]+$' then '50+'
    else '50+'
  end;

alter table public.companies
  add constraint companies_employee_count_valid check (
    employee_count is null
    or employee_count in ('1-5', '6-10', '11-20', '21-50', '50+')
  );
