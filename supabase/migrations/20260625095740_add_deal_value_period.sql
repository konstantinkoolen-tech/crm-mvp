alter table public.deals
add column if not exists value_period text not null default 'mrr';

alter table public.deals
drop constraint if exists deals_value_period_valid;

alter table public.deals
add constraint deals_value_period_valid
check (value_period in ('mrr', 'arr'));
