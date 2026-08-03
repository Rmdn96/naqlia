begin;

create table public.lead_reference_counters (
  reference_month date not null,
  last_sequence integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pk_lead_reference_counters primary key (reference_month),
  constraint ck_lead_reference_counters__month_start
    check (reference_month = date_trunc('month', reference_month)::date),
  constraint ck_lead_reference_counters__last_sequence
    check (last_sequence >= 0)
);

alter table public.lead_reference_counters enable row level security;

revoke all on table public.lead_reference_counters from anon, authenticated, service_role;

alter table public.leads
  alter column reference_number drop default,
  drop constraint ck_leads__reference_number;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.leads'::regclass
      and conname = 'uq_leads__reference_number'
      and contype = 'u'
  ) then
    raise exception using
      errcode = '23514',
      message = 'Lead reference uniqueness constraint is required';
  end if;

  if exists (
    select 1
    from public.leads
    group by date_trunc('month', timezone('Asia/Riyadh', submitted_at))::date
    having count(*) > 999999
  ) then
    raise exception using
      errcode = '22003',
      message = 'A Lead reference month exceeds the six-digit sequence capacity';
  end if;
end;
$$;

alter table public.leads disable trigger trg_leads__before_insert_update__validate;

update public.leads
set reference_number = 'migrating-' || id::text;

with numbered_leads as (
  select
    id,
    date_trunc('month', timezone('Asia/Riyadh', submitted_at))::date as reference_month,
    row_number() over (
      partition by date_trunc('month', timezone('Asia/Riyadh', submitted_at))::date
      order by submitted_at, id
    ) as sequence_number
  from public.leads
)
update public.leads
set reference_number =
  'NQ-' || to_char(numbered_leads.reference_month, 'YYYYMM') || '-'
  || lpad(numbered_leads.sequence_number::text, 6, '0')
from numbered_leads
where leads.id = numbered_leads.id;

alter table public.leads enable trigger trg_leads__before_insert_update__validate;

insert into public.lead_reference_counters (reference_month, last_sequence)
select
  date_trunc('month', timezone('Asia/Riyadh', submitted_at))::date,
  count(*)::integer
from public.leads
group by date_trunc('month', timezone('Asia/Riyadh', submitted_at))::date;

alter table public.leads
  add constraint ck_leads__reference_number
    check (reference_number ~ '^NQ-[0-9]{6}-[0-9]{6}$');

create or replace function private.next_lead_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  reference_month date := date_trunc(
    'month',
    timezone('Asia/Riyadh', clock_timestamp())
  )::date;
  next_sequence integer;
begin
  insert into public.lead_reference_counters as counters (
    reference_month,
    last_sequence
  )
  values (reference_month, 1)
  on conflict (reference_month) do update
  set
    last_sequence = counters.last_sequence + 1,
    updated_at = now()
  returning last_sequence into next_sequence;

  if next_sequence > 999999 then
    raise exception using
      errcode = '22003',
      message = 'Lead reference month exceeds the six-digit sequence capacity';
  end if;

  return 'NQ-' || to_char(reference_month, 'YYYYMM') || '-'
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

create or replace function private.validate_lead_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_exists boolean;
  delivery_owner uuid;
  option_count integer;
  pickup_exists boolean;
  pickup_owner uuid;
  selected_service record;
begin
  if tg_op = 'INSERT' and auth.role() = 'anon' then
    new.profile_id := null;
    new.source := 'web';
    new.status := 'new';
    new.internal_notes := null;
    new.qualified_at := null;
    new.closed_at := null;
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.reference_number <> old.reference_number
      or new.profile_id is distinct from old.profile_id
      or new.submitted_at <> old.submitted_at
    then
      raise exception using errcode = '23514', message = 'Lead identity and ownership are immutable';
    end if;

    if new.status is distinct from old.status
      and not (
        (old.status = 'new' and new.status in ('qualified', 'cancelled', 'closed'))
        or (old.status = 'qualified' and new.status in ('quoted', 'cancelled', 'closed'))
        or (old.status = 'quoted' and new.status in ('converted', 'cancelled', 'closed'))
      )
    then
      raise exception using errcode = '23514', message = 'Unsupported Lead status transition';
    end if;
  end if;

  select id, service_key, name_ar, name_en, transport_scope
  into selected_service
  from public.services
  where id = new.service_id
    and status = 'active'
    and deleted_at is null;

  if selected_service.id is null then
    raise exception using errcode = '23514', message = 'Lead requires an active Service';
  end if;

  new.service_snapshot := jsonb_build_object(
    'id', selected_service.id,
    'service_key', selected_service.service_key,
    'name_ar', selected_service.name_ar,
    'name_en', selected_service.name_en,
    'transport_scope', selected_service.transport_scope
  );

  select
    count(*),
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', service_options.id,
          'option_key', service_options.option_key,
          'name_ar', service_options.name_ar,
          'name_en', service_options.name_en
        )
        order by requested_options.ordinality
      ),
      '[]'::jsonb
    )
  into option_count, new.service_options_snapshot
  from unnest(new.requested_service_option_ids) with ordinality as requested_options(id, ordinality)
  join public.service_options
    on service_options.id = requested_options.id
    and service_options.status = 'active'
    and service_options.deleted_at is null
    and (
      service_options.service_id is null
      or service_options.service_id = new.service_id
    );

  if option_count <> cardinality(new.requested_service_option_ids) then
    raise exception using errcode = '23514', message = 'Lead contains an unavailable Service Option';
  end if;

  if cardinality(new.requested_service_option_ids)
    <> cardinality(array(select distinct value from unnest(new.requested_service_option_ids) as value))
  then
    raise exception using errcode = '23514', message = 'Lead Service Options must be unique';
  end if;

  select true, profile_id
  into pickup_exists, pickup_owner
  from public.addresses
  where id = new.pickup_address_id
    and deleted_at is null;

  select true, profile_id
  into delivery_exists, delivery_owner
  from public.addresses
  where id = new.delivery_address_id
    and deleted_at is null;

  if coalesce(pickup_exists, false) = false
    or coalesce(delivery_exists, false) = false
    or pickup_owner is distinct from new.profile_id
    or delivery_owner is distinct from new.profile_id
  then
    raise exception using errcode = '23514', message = 'Lead addresses must exist and match Lead ownership';
  end if;

  if new.status = 'qualified' and new.qualified_at is null then
    new.qualified_at := now();
  end if;

  if new.status in ('closed', 'cancelled') and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

create trigger trg_leads__before_insert__assign_public_reference
before insert on public.leads
for each row execute function private.assign_lead_public_reference();

revoke all on function private.next_lead_reference() from public, anon, authenticated, service_role;
revoke all on function private.assign_lead_public_reference() from public, anon, authenticated, service_role;

comment on table public.lead_reference_counters is
  'Private concurrency-safe monthly counters used only to allocate public Lead references.';
comment on column public.leads.reference_number is
  'Immutable public Lead reference in NQ-YYYYMM-000001 format. UUID remains the primary key; uq_leads__reference_number provides the unique index.';
comment on function private.next_lead_reference() is
  'Atomically allocates the next unique NQ-YYYYMM-000001 Lead reference using the Asia/Riyadh calendar month.';

commit;
