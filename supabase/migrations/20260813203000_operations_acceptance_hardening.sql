begin;

create or replace function public.operations_save_trip(p_trip uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_old public.trips%rowtype;
  v_new public.trips%rowtype;
  v_driver uuid;
  v_vehicle uuid;
  v_conflicts jsonb;
  v_override boolean := coalesce((p_payload ->> 'override_conflict')::boolean, false);
  v_reason text := nullif(btrim(p_payload ->> 'reason'), '');
begin
  v_actor := private.require_operations_permission('operations.workspace.manage');

  select * into v_old from public.trips where id = p_trip for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Trip not found';
  end if;

  v_driver := nullif(p_payload ->> 'driver_id', '')::uuid;
  v_vehicle := nullif(p_payload ->> 'vehicle_id', '')::uuid;

  if v_driver is not null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('operations-driver:' || v_driver::text, 0)
    );
  end if;
  if v_vehicle is not null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('operations-vehicle:' || v_vehicle::text, 0)
    );
  end if;

  if v_driver is not null and not exists (
    select 1 from public.drivers where id = v_driver and status = 'active'
  ) then
    raise exception using errcode = '23514', message = 'Inactive Driver cannot be assigned';
  end if;
  if v_vehicle is not null and not exists (
    select 1 from public.vehicles where id = v_vehicle and status = 'active'
  ) then
    raise exception using errcode = '23514', message = 'Inactive Vehicle cannot be assigned';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object(
      'trip_id', t.id,
      'trip_number', t.trip_number,
      'driver_conflict', t.driver_id = v_driver,
      'vehicle_conflict', t.vehicle_id = v_vehicle
    )),
    '[]'::jsonb
  )
  into v_conflicts
  from public.trips t
  where t.id <> p_trip
    and t.status not in ('delivered', 'cancelled')
    and tstzrange(t.pickup_window_start, t.delivery_window_end, '[)')
      && tstzrange(
        (p_payload ->> 'pickup_window_start')::timestamptz,
        (p_payload ->> 'delivery_window_end')::timestamptz,
        '[)'
      )
    and (t.driver_id = v_driver or t.vehicle_id = v_vehicle);

  if jsonb_array_length(v_conflicts) > 0 and not v_override then
    return jsonb_build_object('state', 'conflict', 'conflicts', v_conflicts);
  end if;

  if (
    jsonb_array_length(v_conflicts) > 0
    or v_old.status not in ('unscheduled', 'scheduled', 'confirmed')
  ) and (
    v_old.driver_id is distinct from v_driver
    or v_old.vehicle_id is distinct from v_vehicle
  ) and (v_reason is null or char_length(v_reason) < 8) then
    raise exception using errcode = '22023', message = 'Resource change/override reason is required';
  end if;

  update public.trips
  set
    pickup_window_start = (p_payload ->> 'pickup_window_start')::timestamptz,
    pickup_window_end = (p_payload ->> 'pickup_window_end')::timestamptz,
    delivery_window_start = (p_payload ->> 'delivery_window_start')::timestamptz,
    delivery_window_end = (p_payload ->> 'delivery_window_end')::timestamptz,
    driver_id = v_driver,
    vehicle_id = v_vehicle,
    workers_count = coalesce((p_payload ->> 'workers_count')::int, 0),
    status = case when status = 'unscheduled' then 'scheduled' else status end,
    version = version + 1,
    updated_at = now(),
    updated_by_profile_id = v_actor
  where id = p_trip
  returning * into v_new;

  if v_old.driver_id is distinct from v_new.driver_id
    or v_old.vehicle_id is distinct from v_new.vehicle_id then
    insert into public.trip_assignment_history(
      trip_id,
      previous_driver_id,
      new_driver_id,
      previous_vehicle_id,
      new_vehicle_id,
      reason,
      conflict_override,
      actor_profile_id
    ) values (
      p_trip,
      v_old.driver_id,
      v_new.driver_id,
      v_old.vehicle_id,
      v_new.vehicle_id,
      v_reason,
      jsonb_array_length(v_conflicts) > 0,
      v_actor
    );
  end if;

  perform private.write_operation_activity(
    v_new.job_id,
    v_new.id,
    case when v_old.pickup_window_start is null then 'trip_scheduled' else 'trip_schedule_updated' end,
    v_actor,
    jsonb_build_object('trip_number', v_new.trip_number)
  );
  if jsonb_array_length(v_conflicts) > 0 then
    perform private.write_operation_activity(
      v_new.job_id,
      v_new.id,
      'schedule_conflict_overridden',
      v_actor,
      jsonb_build_object('reason', v_reason, 'conflict_count', jsonb_array_length(v_conflicts))
    );
  end if;
  perform private.refresh_job_state(v_new.job_id);
  return jsonb_build_object('state', 'saved', 'trip', to_jsonb(v_new), 'conflicts', v_conflicts);
end;
$$;

create or replace function private.issue_job_tracking_access(p_job uuid, p_actor uuid)
returns table(access_id uuid, plaintext_token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
  v_revoked_count integer;
begin
  perform 1
  from public.operational_jobs
  where id = p_job and status <> 'cancelled'
  for update;
  if not found then
    raise exception using errcode = '23514', message = 'Tracking access requires an active Job';
  end if;

  update public.job_tracking_accesses
  set
    status = 'revoked',
    revoked_at = now(),
    revocation_reason = 'rotated',
    updated_at = now()
  where job_id = p_job and status = 'active';
  get diagnostics v_revoked_count = row_count;

  if v_revoked_count > 0 then
    perform private.write_operation_activity(
      p_job,
      null,
      'tracking_access_revoked',
      p_actor,
      jsonb_build_object('reason', 'rotated')
    );
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.job_tracking_accesses(
    job_id,
    token_hash,
    expires_at,
    created_by_profile_id
  ) values (
    p_job,
    extensions.digest(v_token, 'sha256'),
    now() + interval '180 days',
    p_actor
  )
  returning id into access_id;

  perform private.write_operation_activity(
    p_job,
    null,
    'tracking_access_issued',
    p_actor,
    '{}'::jsonb
  );
  plaintext_token := v_token;
  return next;
end;
$$;

create or replace function public.operations_review_cancellation(
  p_request uuid,
  p_decision text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_req public.job_cancellation_requests%rowtype;
  v_job public.operational_jobs%rowtype;
begin
  v_actor := private.require_operations_permission('operations.workspace.manage');
  if p_decision not in ('approved', 'rejected')
    or p_reason is null
    or char_length(btrim(p_reason)) < 8 then
    raise exception using errcode = '22023', message = 'Decision and reason are required';
  end if;

  select * into v_req
  from public.job_cancellation_requests
  where id = p_request
  for update;
  if not found or v_req.status <> 'pending' then
    raise exception using errcode = '23514', message = 'Cancellation request is not pending';
  end if;

  perform 1
  from public.trips
  where job_id = v_req.job_id and status not in ('delivered', 'cancelled')
  order by id
  for update;

  select * into v_job
  from public.operational_jobs
  where id = v_req.job_id
  for update;

  if p_decision = 'approved'
    and v_job.status in ('awaiting_customer_confirmation', 'completed', 'cancelled') then
    raise exception using errcode = '23514', message = 'Delivered or terminal Job cannot be cancelled';
  end if;

  update public.job_cancellation_requests
  set
    status = p_decision,
    decided_at = now(),
    decided_by_profile_id = v_actor,
    internal_decision_reason = btrim(p_reason),
    updated_at = now()
  where id = p_request
  returning * into v_req;

  if p_decision = 'approved' then
    update public.trips
    set
      status = 'cancelled',
      cancelled_at = now(),
      version = version + 1,
      updated_at = now(),
      updated_by_profile_id = v_actor
    where job_id = v_req.job_id and status not in ('delivered', 'cancelled');

    update public.operational_jobs
    set
      status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = btrim(p_reason),
      updated_at = now()
    where id = v_req.job_id and status not in ('completed', 'cancelled');

    update public.orders o
    set execution_status = 'cancelled', updated_at = now()
    where o.id = v_job.order_id and o.execution_status <> 'completed';
  end if;

  perform private.write_operation_activity(
    v_req.job_id,
    null,
    case when p_decision = 'approved' then 'cancellation_approved' else 'cancellation_rejected' end,
    v_actor,
    '{}'::jsonb
  );
  return to_jsonb(v_req);
end;
$$;

revoke all on function public.operations_save_trip(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.operations_review_cancellation(uuid, text, text) from public, anon, authenticated;
grant execute on function public.operations_save_trip(uuid, jsonb) to authenticated;
grant execute on function public.operations_review_cancellation(uuid, text, text) to authenticated;
revoke all on function private.issue_job_tracking_access(uuid, uuid)
from public, anon, authenticated, service_role;

comment on function public.operations_save_trip(uuid, jsonb) is
  'Serializes Driver/Vehicle scheduling decisions with transaction advisory locks before conflict evaluation.';
comment on function public.operations_review_cancellation(uuid, text, text) is
  'Reviews a customer cancellation request and reconciles non-terminal Trips atomically.';
comment on function private.issue_job_tracking_access(uuid, uuid) is
  'Rotates a 256-bit tracking capability, records revocation without persisting plaintext, then issues one replacement.';

commit;
