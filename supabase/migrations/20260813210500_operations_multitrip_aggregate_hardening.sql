begin;

create or replace function private.refresh_job_state(p_job uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state text;
  v_total integer;
  v_delivered integer;
  v_active integer;
  v_scheduled integer;
  v_attention boolean;
begin
  select
    count(*),
    count(*) filter (where status = 'delivered'),
    count(*) filter (
      where status in ('confirmed', 'en_route_pickup', 'loading', 'in_transit', 'arrived')
    ),
    count(*) filter (where status <> 'unscheduled'),
    bool_or(condition <> 'normal')
  into v_total, v_delivered, v_active, v_scheduled, v_attention
  from public.trips
  where job_id = p_job and status <> 'cancelled';

  select status into v_state
  from public.operational_jobs
  where id = p_job
  for update;

  if v_state in ('completed', 'cancelled') then
    return v_state;
  end if;

  v_state := case
    when v_total = 0 then 'unscheduled'
    when v_delivered = v_total then 'awaiting_customer_confirmation'
    when v_active > 0 or v_delivered > 0 then 'in_progress'
    when v_scheduled > 0 then 'scheduled'
    else 'unscheduled'
  end;

  update public.operational_jobs
  set
    status = v_state,
    attention_required = coalesce(v_attention, false),
    updated_at = now()
  where id = p_job;

  return v_state;
end;
$$;

revoke all on function private.refresh_job_state(uuid)
from public, anon, authenticated, service_role;

comment on function private.refresh_job_state(uuid) is
  'Derives Job aggregate state without regressing partially delivered multi-Trip work to Scheduled.';

commit;
