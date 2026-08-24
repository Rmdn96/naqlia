begin;

do $$
begin
  if to_regclass('public.lead_reference_counters') is null then
    raise exception using
      errcode = '42P01',
      message = 'Lead reference counters are missing; apply 20260803171000 first';
  end if;

  if exists (
    select 1
    from public.leads
    where reference_number !~ '^NQ-[0-9]{6}-[0-9]{6}$'
  ) then
    raise exception using
      errcode = '23514',
      message = 'Non-NQ Lead references remain; reconcile the missing standardization migration first';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.leads'::regclass
      and conname = 'uq_leads__reference_number'
      and contype = 'u'
  ) then
    raise exception using
      errcode = '23514',
      message = 'Lead reference uniqueness constraint is required';
  end if;
end;
$$;

alter table public.leads
  alter column reference_number drop default,
  drop constraint if exists ck_leads__reference_number;

alter table public.leads
  add constraint ck_leads__reference_number
    check (reference_number ~ '^NQ-[0-9]{6}-[0-9]{6}$');

insert into public.lead_reference_counters as counters (
  reference_month,
  last_sequence
)
select
  to_date(substring(leads.reference_number from 4 for 6), 'YYYYMM'),
  max(substring(leads.reference_number from 11 for 6)::integer)
from public.leads
group by to_date(substring(leads.reference_number from 4 for 6), 'YYYYMM')
on conflict on constraint pk_lead_reference_counters do update
set
  last_sequence = greatest(counters.last_sequence, excluded.last_sequence),
  updated_at = now();

create or replace function private.next_lead_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_reference_month date := date_trunc(
    'month',
    timezone('Asia/Riyadh', clock_timestamp())
  )::date;
  next_sequence integer;
begin
  insert into public.lead_reference_counters as counters (
    reference_month,
    last_sequence
  )
  values (current_reference_month, 1)
  on conflict on constraint pk_lead_reference_counters do update
  set
    last_sequence = counters.last_sequence + 1,
    updated_at = now()
  returning counters.last_sequence into next_sequence;

  if next_sequence > 999999 then
    raise exception using
      errcode = '22003',
      message = 'Lead reference month exceeds the six-digit sequence capacity';
  end if;

  return 'NQ-' || to_char(current_reference_month, 'YYYYMM') || '-'
    || lpad(next_sequence::text, 6, '0');
end;
$$;

create or replace function private.assign_lead_public_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.reference_number := private.next_lead_reference();
  return new;
end;
$$;

drop trigger if exists trg_leads__before_insert__assign_public_reference
  on public.leads;

create trigger trg_leads__before_insert__assign_public_reference
before insert on public.leads
for each row execute function private.assign_lead_public_reference();

revoke all on function private.next_lead_reference()
  from public, anon, authenticated, service_role;
revoke all on function private.assign_lead_public_reference()
  from public, anon, authenticated, service_role;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_proc functions
    join pg_catalog.pg_namespace namespaces
      on namespaces.oid = functions.pronamespace
    where functions.prokind = 'f'
      and namespaces.nspname not in ('pg_catalog', 'information_schema')
      and pg_catalog.pg_get_functiondef(functions.oid) like '%LD-%'
  ) then
    raise exception using
      errcode = '23514',
      message = 'A legacy LD Lead reference generator remains active';
  end if;

  if has_function_privilege('anon', 'private.next_lead_reference()', 'execute')
    or has_function_privilege('authenticated', 'private.next_lead_reference()', 'execute')
    or has_function_privilege('service_role', 'private.next_lead_reference()', 'execute')
  then
    raise exception using
      errcode = '42501',
      message = 'Lead reference allocator has an unexpected execute grant';
  end if;
end;
$$;

comment on function private.next_lead_reference() is
  'Atomically allocates the next unique NQ-YYYYMM-000001 Lead reference using an unambiguous Asia/Riyadh monthly counter conflict target.';
comment on function private.assign_lead_public_reference() is
  'Overrides every inserted Lead public reference with the database-authoritative NQ monthly allocator.';

commit;
