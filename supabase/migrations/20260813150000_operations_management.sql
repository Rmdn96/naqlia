begin;

insert into public.permissions (permission_key, description_ar, description_en, risk_level, status)
values
  ('operations.workspace.read', 'عرض مساحة عمل العمليات', 'Read the Operations workspace', 'low', 'active'),
  ('operations.workspace.manage', 'إدارة التنفيذ والموارد التشغيلية', 'Manage operational execution and resources', 'high', 'active')
on conflict (permission_key) do update set
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  risk_level = excluded.risk_level,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id, status, grant_reason)
select roles.id, permissions.id, 'active', 'Operations Management v1 approved role boundary'
from public.roles cross join public.permissions
where roles.role_key in ('operations', 'super_admin')
  and permissions.permission_key in ('operations.workspace.read', 'operations.workspace.manage')
on conflict (role_id, permission_id) where status = 'active' do nothing;

-- Sales retains read-only operational context. It receives no mutation grant.
insert into public.role_permissions (role_id, permission_id, status, grant_reason)
select roles.id, permissions.id, 'active', 'Sales read-only visibility of post-acceptance execution'
from public.roles cross join public.permissions
where roles.role_key = 'sales' and permissions.permission_key = 'operations.workspace.read'
on conflict (role_id, permission_id) where status = 'active' do nothing;

create table public.external_transport_companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  mobile_number text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint ck_external_transport_companies__name check (char_length(btrim(company_name)) between 2 and 200),
  constraint ck_external_transport_companies__mobile check (mobile_number is null or mobile_number ~ '^\+9665[0-9]{8}$'),
  constraint ck_external_transport_companies__status check (status in ('active','inactive'))
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  mobile_number text not null,
  relationship_type text not null,
  external_company_id uuid references public.external_transport_companies(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint uq_drivers__mobile_number unique (mobile_number),
  constraint ck_drivers__name check (char_length(btrim(display_name)) between 2 and 150),
  constraint ck_drivers__mobile check (mobile_number ~ '^\+9665[0-9]{8}$'),
  constraint ck_drivers__relationship check (relationship_type in ('company','independent','external_company')),
  constraint ck_drivers__company check ((relationship_type = 'external_company') = (external_company_id is not null)),
  constraint ck_drivers__status check (status in ('active','inactive'))
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_type text not null,
  plate_number text not null,
  provider_type text not null,
  external_company_id uuid references public.external_transport_companies(id) on delete restrict,
  operational_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint uq_vehicles__plate_number unique (plate_number),
  constraint ck_vehicles__type check (char_length(btrim(vehicle_type)) between 2 and 100),
  constraint ck_vehicles__plate check (char_length(btrim(plate_number)) between 2 and 30),
  constraint ck_vehicles__provider check (provider_type in ('company','independent','external_company')),
  constraint ck_vehicles__company check ((provider_type = 'external_company') = (external_company_id is not null)),
  constraint ck_vehicles__metadata check (jsonb_typeof(operational_metadata) = 'object'),
  constraint ck_vehicles__status check (status in ('active','inactive'))
);

create table public.operational_jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null default ('JB-' || to_char(clock_timestamp() at time zone 'UTC','YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  order_id uuid not null references public.orders(id) on delete restrict,
  status text not null default 'unscheduled',
  attention_required boolean not null default false,
  customer_confirmed_at timestamptz,
  manually_completed_at timestamptz,
  manual_completion_reason text,
  completed_by_profile_id uuid references public.profiles(id) on delete restrict,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint uq_operational_jobs__job_number unique (job_number),
  constraint uq_operational_jobs__order_id unique (order_id),
  constraint ck_operational_jobs__status check (status in ('unscheduled','scheduled','in_progress','awaiting_customer_confirmation','completed','cancelled')),
  constraint ck_operational_jobs__manual_completion check (manually_completed_at is null or char_length(btrim(manual_completion_reason)) between 8 and 1000)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.operational_jobs(id) on delete restrict,
  trip_number integer not null,
  status text not null default 'unscheduled',
  pickup_window_start timestamptz,
  pickup_window_end timestamptz,
  delivery_window_start timestamptz,
  delivery_window_end timestamptz,
  schedule_timezone text not null default 'Asia/Riyadh',
  driver_id uuid references public.drivers(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete restrict,
  workers_count integer not null default 0,
  condition text not null default 'normal',
  condition_internal_reason text,
  condition_customer_message_ar text,
  condition_customer_message_en text,
  condition_recorded_at timestamptz,
  condition_resolved_at timestamptz,
  started_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  constraint uq_trips__job_number unique (job_id, trip_number),
  constraint ck_trips__status check (status in ('unscheduled','scheduled','confirmed','en_route_pickup','loading','in_transit','arrived','delivered','cancelled')),
  constraint ck_trips__workers check (workers_count between 0 and 100),
  constraint ck_trips__timezone check (schedule_timezone = 'Asia/Riyadh'),
  constraint ck_trips__condition check (condition in ('normal','delayed','paused','operational_issue')),
  constraint ck_trips__windows check (
    (pickup_window_start is null and pickup_window_end is null and delivery_window_start is null and delivery_window_end is null)
    or (pickup_window_start < pickup_window_end and pickup_window_end <= delivery_window_start and delivery_window_start < delivery_window_end)
  ),
  constraint ck_trips__schedule_state check (status = 'unscheduled' or pickup_window_start is not null),
  constraint ck_trips__condition_reason check (condition = 'normal' or char_length(btrim(condition_internal_reason)) between 8 and 2000)
);

create table public.trip_assignment_history (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete restrict,
  previous_driver_id uuid references public.drivers(id) on delete restrict,
  new_driver_id uuid references public.drivers(id) on delete restrict,
  previous_vehicle_id uuid references public.vehicles(id) on delete restrict,
  new_vehicle_id uuid references public.vehicles(id) on delete restrict,
  reason text,
  conflict_override boolean not null default false,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  occurred_at timestamptz not null default now(),
  constraint ck_trip_assignment_history__change check (previous_driver_id is distinct from new_driver_id or previous_vehicle_id is distinct from new_vehicle_id),
  constraint ck_trip_assignment_history__reason check (reason is null or char_length(btrim(reason)) between 8 and 1000)
);

create table public.job_tracking_accesses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.operational_jobs(id) on delete restrict,
  token_hash bytea not null,
  status text not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_job_tracking_accesses__token_hash unique (token_hash),
  constraint ck_job_tracking_accesses__hash check (octet_length(token_hash)=32),
  constraint ck_job_tracking_accesses__status check (status in ('active','revoked')),
  constraint ck_job_tracking_accesses__expiry check (expires_at > issued_at)
);
create unique index uq_job_tracking_accesses__active_job on public.job_tracking_accesses(job_id) where status='active';

create table public.job_cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.operational_jobs(id) on delete restrict,
  status text not null default 'pending',
  customer_reason text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by_profile_id uuid references public.profiles(id) on delete restrict,
  internal_decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_job_cancellation_requests__status check (status in ('pending','approved','rejected')),
  constraint ck_job_cancellation_requests__reason check (customer_reason is null or char_length(btrim(customer_reason)) between 2 and 500),
  constraint ck_job_cancellation_requests__decision check ((status='pending' and decided_at is null and decided_by_profile_id is null) or (status in ('approved','rejected') and decided_at is not null and decided_by_profile_id is not null and char_length(btrim(internal_decision_reason)) between 8 and 1000))
);
create unique index uq_job_cancellation_requests__pending_job on public.job_cancellation_requests(job_id) where status='pending';

create index idx_jobs__status_updated on public.operational_jobs(status, updated_at desc);
create index idx_trips__job_status on public.trips(job_id,status);
create index idx_trips__driver_window on public.trips(driver_id,pickup_window_start,delivery_window_end) where status not in ('delivered','cancelled');
create index idx_trips__vehicle_window on public.trips(vehicle_id,pickup_window_start,delivery_window_end) where status not in ('delivered','cancelled');

alter table public.lead_activity_logs add column job_id uuid references public.operational_jobs(id) on delete restrict;
alter table public.lead_activity_logs add column trip_id uuid references public.trips(id) on delete restrict;
alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check (event_key in (
 'lead_created','lead_viewed','lead_qualified','lead_quoted','lead_order_ready','lead_closed','lead_cancelled',
 'quotation_draft_created','quotation_draft_updated','quotation_sent','quotation_approved','quotation_rejected','quotation_expired','quotation_superseded','quotation_cancelled',
 'customer_quotation_access_issued','customer_quotation_viewed','customer_accepted_quotation','customer_rejected_quotation','order_created_from_quotation','customer_access_revoked',
 'job_created','trip_created','trip_scheduled','trip_schedule_updated','driver_assigned','driver_changed','vehicle_assigned','vehicle_changed','workers_count_changed','schedule_conflict_overridden',
 'trip_status_changed','trip_state_overridden','trip_condition_recorded','trip_condition_resolved','expected_timing_updated','tracking_access_issued','tracking_access_revoked',
 'cancellation_requested','cancellation_approved','cancellation_rejected','customer_confirmed_receipt','job_manually_completed'
));

create or replace function private.require_operations_permission(p_permission text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_profile uuid;
begin
 if auth.role()<>'authenticated' or not private.has_permission_authoritative(p_permission) then raise exception using errcode='42501',message='Operations permission is required'; end if;
 v_profile:=private.current_profile_id_authoritative();
 if v_profile is null then raise exception using errcode='42501',message='Active staff profile is required'; end if;
 return v_profile;
end $$;

create or replace function private.write_operation_activity(p_job uuid,p_trip uuid,p_event text,p_actor uuid,p_details jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_lead uuid; v_quotation uuid;
begin
 select q.lead_id,q.id into v_lead,v_quotation from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id where j.id=p_job;
 insert into public.lead_activity_logs(lead_id,quotation_id,job_id,trip_id,event_key,actor_profile_id,details)
 values(v_lead,v_quotation,p_job,p_trip,p_event,p_actor,coalesce(p_details,'{}'::jsonb)) returning id into v_id;
 return v_id;
end $$;

create or replace function private.refresh_job_state(p_job uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_state text; v_total int; v_delivered int; v_active int; v_scheduled int; v_attention boolean;
begin
 select count(*),count(*) filter(where status='delivered'),count(*) filter(where status in ('confirmed','en_route_pickup','loading','in_transit','arrived')),count(*) filter(where status<>'unscheduled'),bool_or(condition<>'normal')
 into v_total,v_delivered,v_active,v_scheduled,v_attention from public.trips where job_id=p_job and status<>'cancelled';
 select status into v_state from public.operational_jobs where id=p_job for update;
 if v_state in ('completed','cancelled') then return v_state; end if;
 v_state:=case when v_total=0 then 'unscheduled' when v_delivered=v_total then 'awaiting_customer_confirmation' when v_active>0 then 'in_progress' when v_scheduled>0 then 'scheduled' else 'unscheduled' end;
 update public.operational_jobs set status=v_state,attention_required=coalesce(v_attention,false),updated_at=now() where id=p_job;
 return v_state;
end $$;

create or replace function private.create_job_for_order()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_job uuid;
begin
 insert into public.operational_jobs(order_id,created_by_profile_id) values(new.id,new.created_by_profile_id) on conflict(order_id) do nothing returning id into v_job;
 if v_job is not null then perform private.write_operation_activity(v_job,null,'job_created',new.created_by_profile_id,jsonb_build_object('order_number',new.order_number)); end if;
 return new;
end $$;
create trigger trg_orders__after_insert__create_job after insert on public.orders for each row execute function private.create_job_for_order();

insert into public.operational_jobs(order_id,created_by_profile_id)
select id,created_by_profile_id from public.orders on conflict(order_id) do nothing;
insert into public.lead_activity_logs(lead_id,quotation_id,job_id,event_key,actor_profile_id,details)
select q.lead_id,q.id,j.id,'job_created',j.created_by_profile_id,jsonb_build_object('order_number',o.order_number,'backfilled',true)
from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id
where not exists(select 1 from public.lead_activity_logs a where a.job_id=j.id and a.event_key='job_created');

create or replace function public.operations_list_jobs(p_page int default 1,p_page_size int default 20,p_search text default null,p_status text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_result jsonb; v_offset int:=(greatest(coalesce(p_page,1),1)-1)*least(greatest(coalesce(p_page_size,20),1),100);
begin
 perform private.require_operations_permission('operations.workspace.read');
 with filtered as (
  select j.id,j.job_number,j.status,j.attention_required,j.updated_at,o.order_number,l.reference_number,l.customer_name,l.mobile_number,s.name_ar service_name_ar,s.name_en service_name_en,pc.name_ar pickup_city_ar,pc.name_en pickup_city_en,
   (select min(t.pickup_window_start) from public.trips t where t.job_id=j.id and t.status<>'cancelled') pickup_window_start,
   (select count(*) from public.trips t where t.job_id=j.id) trip_count
  from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id join public.leads l on l.id=q.lead_id join public.services s on s.id=l.service_id join public.addresses pa on pa.id=l.pickup_address_id join public.cities pc on pc.id=pa.city_id
  where (p_status is null or j.status=p_status) and (nullif(btrim(coalesce(p_search,'')),'') is null or l.reference_number ilike '%'||btrim(p_search)||'%' or l.customer_name ilike '%'||btrim(p_search)||'%' or l.mobile_number ilike '%'||btrim(p_search)||'%' or j.job_number ilike '%'||btrim(p_search)||'%')
 ), paged as (select * from filtered order by attention_required desc,updated_at desc limit least(greatest(coalesce(p_page_size,20),1),100) offset v_offset)
 select jsonb_build_object('page',greatest(coalesce(p_page,1),1),'page_size',least(greatest(coalesce(p_page_size,20),1),100),'total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb)) into v_result;
 return v_result;
end $$;

create or replace function public.operations_get_job(p_job uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_result jsonb;
begin
 perform private.require_operations_permission('operations.workspace.read');
 select jsonb_build_object(
  'job',jsonb_build_object('id',j.id,'job_number',j.job_number,'status',j.status,'attention_required',j.attention_required,'customer_confirmed_at',j.customer_confirmed_at),
  'order',jsonb_build_object('order_number',o.order_number,'currency',o.currency,'subtotal_amount',o.subtotal_amount,'tax_amount',o.tax_amount,'total_amount',o.total_amount),
  'lead',jsonb_build_object('reference_number',l.reference_number,'customer_name',l.customer_name,'mobile_number',l.mobile_number,'customer_notes',l.customer_notes,'service_name_ar',s.name_ar,'service_name_en',s.name_en),
  'pickup',jsonb_build_object('formatted_address',pa.formatted_address,'city_ar',pc.name_ar,'city_en',pc.name_en),
  'delivery',jsonb_build_object('formatted_address',da.formatted_address,'city_ar',dc.name_ar,'city_en',dc.name_en),
  'quotation',jsonb_build_object('quotation_number',q.quotation_number,'revision_number',q.revision_number,'customer_notes',q.customer_notes),
  'trips',coalesce((select jsonb_agg(to_jsonb(t) order by t.trip_number) from public.trips t where t.job_id=j.id),'[]'::jsonb),
  'cancellation_requests',coalesce((select jsonb_agg(to_jsonb(c) order by c.requested_at desc) from public.job_cancellation_requests c where c.job_id=j.id),'[]'::jsonb),
  'activity',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'event_key',a.event_key,'details',a.details,'occurred_at',a.occurred_at,'actor_name',p.display_name) order by a.occurred_at desc) from public.lead_activity_logs a left join public.profiles p on p.id=a.actor_profile_id where a.job_id=j.id),'[]'::jsonb)
 ) into v_result
 from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id join public.leads l on l.id=q.lead_id join public.services s on s.id=l.service_id join public.addresses pa on pa.id=l.pickup_address_id join public.cities pc on pc.id=pa.city_id join public.addresses da on da.id=l.delivery_address_id join public.cities dc on dc.id=da.city_id where j.id=p_job;
 if v_result is null then raise exception using errcode='P0002',message='Operational Job not found'; end if;
 return v_result;
end $$;

create or replace function public.operations_create_trip(p_job uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_trip public.trips%rowtype;
begin
 v_actor:=private.require_operations_permission('operations.workspace.manage');
 perform 1 from public.operational_jobs where id=p_job and status not in ('completed','cancelled') for update;
 if not found then raise exception using errcode='23514',message='Job is not open for Trips'; end if;
 insert into public.trips(job_id,trip_number,created_by_profile_id) select p_job,coalesce(max(trip_number),0)+1,v_actor from public.trips where job_id=p_job returning * into v_trip;
 perform private.write_operation_activity(p_job,v_trip.id,'trip_created',v_actor,jsonb_build_object('trip_number',v_trip.trip_number));
 return to_jsonb(v_trip);
end $$;

create or replace function public.operations_save_trip(p_trip uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_old public.trips%rowtype; v_new public.trips%rowtype; v_driver uuid; v_vehicle uuid; v_conflicts jsonb; v_override boolean:=coalesce((p_payload->>'override_conflict')::boolean,false); v_reason text:=nullif(btrim(p_payload->>'reason'),'');
begin
 v_actor:=private.require_operations_permission('operations.workspace.manage'); select * into v_old from public.trips where id=p_trip for update; if not found then raise exception using errcode='P0002',message='Trip not found'; end if;
 v_driver:=nullif(p_payload->>'driver_id','')::uuid; v_vehicle:=nullif(p_payload->>'vehicle_id','')::uuid;
 if v_driver is not null and not exists(select 1 from public.drivers where id=v_driver and status='active') then raise exception using errcode='23514',message='Inactive Driver cannot be assigned'; end if;
 if v_vehicle is not null and not exists(select 1 from public.vehicles where id=v_vehicle and status='active') then raise exception using errcode='23514',message='Inactive Vehicle cannot be assigned'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('trip_id',t.id,'trip_number',t.trip_number,'driver_conflict',t.driver_id=v_driver,'vehicle_conflict',t.vehicle_id=v_vehicle)),'[]'::jsonb) into v_conflicts from public.trips t where t.id<>p_trip and t.status not in ('delivered','cancelled') and tstzrange(t.pickup_window_start,t.delivery_window_end,'[)') && tstzrange((p_payload->>'pickup_window_start')::timestamptz,(p_payload->>'delivery_window_end')::timestamptz,'[)') and (t.driver_id=v_driver or t.vehicle_id=v_vehicle);
 if jsonb_array_length(v_conflicts)>0 and not v_override then return jsonb_build_object('state','conflict','conflicts',v_conflicts); end if;
 if (jsonb_array_length(v_conflicts)>0 or v_old.status not in ('unscheduled','scheduled','confirmed')) and (v_old.driver_id is distinct from v_driver or v_old.vehicle_id is distinct from v_vehicle) and (v_reason is null or char_length(v_reason)<8) then raise exception using errcode='22023',message='Resource change/override reason is required'; end if;
 update public.trips set pickup_window_start=(p_payload->>'pickup_window_start')::timestamptz,pickup_window_end=(p_payload->>'pickup_window_end')::timestamptz,delivery_window_start=(p_payload->>'delivery_window_start')::timestamptz,delivery_window_end=(p_payload->>'delivery_window_end')::timestamptz,driver_id=v_driver,vehicle_id=v_vehicle,workers_count=coalesce((p_payload->>'workers_count')::int,0),status=case when status='unscheduled' then 'scheduled' else status end,version=version+1,updated_at=now(),updated_by_profile_id=v_actor where id=p_trip returning * into v_new;
 if v_old.driver_id is distinct from v_new.driver_id or v_old.vehicle_id is distinct from v_new.vehicle_id then insert into public.trip_assignment_history(trip_id,previous_driver_id,new_driver_id,previous_vehicle_id,new_vehicle_id,reason,conflict_override,actor_profile_id) values(p_trip,v_old.driver_id,v_new.driver_id,v_old.vehicle_id,v_new.vehicle_id,v_reason,jsonb_array_length(v_conflicts)>0,v_actor); end if;
 perform private.write_operation_activity(v_new.job_id,v_new.id,case when v_old.pickup_window_start is null then 'trip_scheduled' else 'trip_schedule_updated' end,v_actor,jsonb_build_object('trip_number',v_new.trip_number));
 if jsonb_array_length(v_conflicts)>0 then perform private.write_operation_activity(v_new.job_id,v_new.id,'schedule_conflict_overridden',v_actor,jsonb_build_object('reason',v_reason,'conflict_count',jsonb_array_length(v_conflicts))); end if;
 perform private.refresh_job_state(v_new.job_id); return jsonb_build_object('state','saved','trip',to_jsonb(v_new),'conflicts',v_conflicts);
end $$;

create or replace function public.operations_transition_trip(p_trip uuid,p_status text,p_override boolean default false,p_reason text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_old public.trips%rowtype; v_new public.trips%rowtype; v_allowed boolean;
begin
 v_actor:=private.require_operations_permission('operations.workspace.manage'); select * into v_old from public.trips where id=p_trip for update; if not found then raise exception using errcode='P0002',message='Trip not found'; end if;
 v_allowed:=p_status=case v_old.status when 'scheduled' then 'confirmed' when 'confirmed' then 'en_route_pickup' when 'en_route_pickup' then 'loading' when 'loading' then 'in_transit' when 'in_transit' then 'arrived' when 'arrived' then 'delivered' else null end;
 if not v_allowed and not (p_status='cancelled' and v_old.status not in ('delivered','cancelled')) and not p_override then raise exception using errcode='23514',message='Unsupported Trip state transition'; end if;
 if p_override and (p_reason is null or char_length(btrim(p_reason))<8) then raise exception using errcode='22023',message='Administrative override reason is required'; end if;
 if v_old.status in ('delivered','cancelled') then raise exception using errcode='23514',message='Terminal Trip state is protected'; end if;
 update public.trips set status=p_status,started_at=case when p_status='en_route_pickup' then coalesce(started_at,now()) else started_at end,delivered_at=case when p_status='delivered' then now() else delivered_at end,cancelled_at=case when p_status='cancelled' then now() else cancelled_at end,version=version+1,updated_at=now(),updated_by_profile_id=v_actor where id=p_trip returning * into v_new;
 perform private.write_operation_activity(v_new.job_id,v_new.id,case when p_override then 'trip_state_overridden' else 'trip_status_changed' end,v_actor,jsonb_build_object('from_status',v_old.status,'to_status',v_new.status,'reason',case when p_override then p_reason else null end)); perform private.refresh_job_state(v_new.job_id); return to_jsonb(v_new);
end $$;

create or replace function public.operations_set_trip_condition(p_trip uuid,p_condition text,p_internal_reason text default null,p_customer_ar text default null,p_customer_en text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_trip public.trips%rowtype;
begin
 v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_condition not in ('normal','delayed','paused','operational_issue') then raise exception using errcode='22023',message='Unsupported condition'; end if;
 if p_condition<>'normal' and (p_internal_reason is null or char_length(btrim(p_internal_reason))<8) then raise exception using errcode='22023',message='Internal condition reason is required'; end if;
 update public.trips set condition=p_condition,condition_internal_reason=case when p_condition='normal' then null else btrim(p_internal_reason) end,condition_customer_message_ar=case when p_condition='normal' then null else nullif(btrim(p_customer_ar),'') end,condition_customer_message_en=case when p_condition='normal' then null else nullif(btrim(p_customer_en),'') end,condition_recorded_at=case when p_condition='normal' then condition_recorded_at else now() end,condition_resolved_at=case when p_condition='normal' then now() else null end,updated_at=now(),updated_by_profile_id=v_actor where id=p_trip returning * into v_trip;
 if not found then raise exception using errcode='P0002',message='Trip not found'; end if; perform private.write_operation_activity(v_trip.job_id,v_trip.id,case when p_condition='normal' then 'trip_condition_resolved' else 'trip_condition_recorded' end,v_actor,jsonb_build_object('condition',p_condition)); perform private.refresh_job_state(v_trip.job_id); return to_jsonb(v_trip);
end $$;

create or replace function private.issue_job_tracking_access(p_job uuid,p_actor uuid)
returns table(access_id uuid,plaintext_token text) language plpgsql security definer set search_path='' as $$
declare v_token text;
begin
 perform 1 from public.operational_jobs where id=p_job and status<>'cancelled' for update; if not found then raise exception using errcode='23514',message='Tracking access requires an active Job'; end if;
 update public.job_tracking_accesses set status='revoked',revoked_at=now(),revocation_reason='rotated',updated_at=now() where job_id=p_job and status='active';
 v_token:=encode(extensions.gen_random_bytes(32),'hex'); insert into public.job_tracking_accesses(job_id,token_hash,expires_at,created_by_profile_id) values(p_job,extensions.digest(v_token,'sha256'),now()+interval '180 days',p_actor) returning id into access_id;
 perform private.write_operation_activity(p_job,null,'tracking_access_issued',p_actor,'{}'::jsonb); plaintext_token:=v_token; return next;
end $$;

create or replace function public.operations_issue_tracking_access(p_job uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_access record; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); select * into v_access from private.issue_job_tracking_access(p_job,v_actor); return jsonb_build_object('tracking_token',v_access.plaintext_token); end $$;

create or replace function private.customer_job_payload(p_job uuid)
returns jsonb language sql security definer set search_path='' stable as $$
select jsonb_build_object('state','active','job',jsonb_build_object('status',j.status,'customer_confirmed_at',j.customer_confirmed_at),'lead',jsonb_build_object('reference_number',l.reference_number,'service_name_ar',s.name_ar,'service_name_en',s.name_en),'pickup',jsonb_build_object('formatted_address',pa.formatted_address),'delivery',jsonb_build_object('formatted_address',da.formatted_address),'trips',coalesce((select jsonb_agg(jsonb_build_object('trip_number',t.trip_number,'status',t.status,'pickup_window_start',t.pickup_window_start,'pickup_window_end',t.pickup_window_end,'delivery_window_start',t.delivery_window_start,'delivery_window_end',t.delivery_window_end,'condition',t.condition,'customer_message_ar',t.condition_customer_message_ar,'customer_message_en',t.condition_customer_message_en,'driver',case when t.status in ('confirmed','en_route_pickup','loading','in_transit','arrived') and d.id is not null then jsonb_build_object('display_name',d.display_name,'mobile_number',d.mobile_number) else null end,'vehicle',case when t.status in ('confirmed','en_route_pickup','loading','in_transit','arrived') and v.id is not null then jsonb_build_object('vehicle_type',v.vehicle_type,'plate_number',v.plate_number) else null end) order by t.trip_number) from public.trips t left join public.drivers d on d.id=t.driver_id left join public.vehicles v on v.id=t.vehicle_id where t.job_id=j.id),'[]'::jsonb),'cancellation_status',(select c.status from public.job_cancellation_requests c where c.job_id=j.id order by c.requested_at desc limit 1)) from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id join public.leads l on l.id=q.lead_id join public.services s on s.id=l.service_id join public.addresses pa on pa.id=l.pickup_address_id join public.addresses da on da.id=l.delivery_address_id where j.id=p_job;
$$;

create or replace function public.customer_get_job_tracking(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_access public.job_tracking_accesses%rowtype; begin if p_token is null or p_token!~'^[a-f0-9]{64}$' then return jsonb_build_object('state','invalid'); end if; select * into v_access from public.job_tracking_accesses where token_hash=extensions.digest(p_token,'sha256') for update; if not found or v_access.status<>'active' or v_access.expires_at<=now() then return jsonb_build_object('state','invalid'); end if; update public.job_tracking_accesses set first_viewed_at=coalesce(first_viewed_at,now()),last_viewed_at=now(),updated_at=now() where id=v_access.id; return private.customer_job_payload(v_access.job_id); end $$;

create or replace function public.customer_recover_job_tracking(p_reference text,p_mobile text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_job uuid; v_access record; v_mobile text; begin v_mobile:=case when regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g')~'^05[0-9]{8}$' then '+966'||substr(regexp_replace(p_mobile,'[^0-9]','','g'),2) when regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g')~'^9665[0-9]{8}$' then '+'||regexp_replace(p_mobile,'[^0-9]','','g') else null end; if p_reference!~'^NQ-[0-9]{6}-[0-9]{6}$' or v_mobile is null then return jsonb_build_object('state','invalid'); end if; select j.id into v_job from public.operational_jobs j join public.orders o on o.id=j.order_id join public.quotations q on q.id=o.quotation_id join public.leads l on l.id=q.lead_id where l.reference_number=upper(p_reference) and o.tracking_mobile_number=v_mobile and j.status<>'cancelled' for update; if not found then return jsonb_build_object('state','invalid'); end if; select * into v_access from private.issue_job_tracking_access(v_job,null); return jsonb_build_object('state','issued','tracking_token',v_access.plaintext_token); end $$;

create or replace function public.customer_confirm_job_receipt(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_access public.job_tracking_accesses%rowtype; v_job public.operational_jobs%rowtype; begin if p_token is null or p_token!~'^[a-f0-9]{64}$' then return jsonb_build_object('state','invalid'); end if; select * into v_access from public.job_tracking_accesses where token_hash=extensions.digest(p_token,'sha256') and status='active' and expires_at>now() for update; if not found then return jsonb_build_object('state','invalid'); end if; select * into v_job from public.operational_jobs where id=v_access.job_id for update; if v_job.status='completed' then return jsonb_build_object('state','completed','confirmed_at',v_job.customer_confirmed_at); end if; if v_job.status<>'awaiting_customer_confirmation' then return jsonb_build_object('state','not_eligible'); end if; update public.operational_jobs set status='completed',customer_confirmed_at=now(),updated_at=now() where id=v_job.id returning * into v_job; update public.orders set execution_status='completed',scheduled_for=coalesce(scheduled_for,created_at),execution_started_at=coalesce(execution_started_at,created_at),completed_at=now(),updated_at=now() where id=v_job.order_id; perform private.write_operation_activity(v_job.id,null,'customer_confirmed_receipt',null,'{}'::jsonb); return jsonb_build_object('state','completed','confirmed_at',v_job.customer_confirmed_at); end $$;

create or replace function public.customer_request_job_cancellation(p_token text,p_reason text default null)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_access public.job_tracking_accesses%rowtype; v_request uuid; v_reason text:=nullif(btrim(p_reason),''); begin if p_token is null or p_token!~'^[a-f0-9]{64}$' or (v_reason is not null and char_length(v_reason) not between 2 and 500) then return jsonb_build_object('state','invalid'); end if; select * into v_access from public.job_tracking_accesses where token_hash=extensions.digest(p_token,'sha256') and status='active' and expires_at>now() for update; if not found then return jsonb_build_object('state','invalid'); end if; perform 1 from public.operational_jobs where id=v_access.job_id and status not in ('completed','cancelled') for update; if not found then return jsonb_build_object('state','not_eligible'); end if; insert into public.job_cancellation_requests(job_id,customer_reason) values(v_access.job_id,v_reason) on conflict(job_id) where status='pending' do nothing returning id into v_request; if v_request is null then return jsonb_build_object('state','pending'); end if; perform private.write_operation_activity(v_access.job_id,null,'cancellation_requested',null,'{}'::jsonb); return jsonb_build_object('state','pending'); end $$;

create or replace function public.operations_complete_job(p_job uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_job public.operational_jobs%rowtype; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_reason is null or char_length(btrim(p_reason))<8 then raise exception using errcode='22023',message='Manual completion reason is required'; end if; select * into v_job from public.operational_jobs where id=p_job for update; if v_job.status<>'awaiting_customer_confirmation' then raise exception using errcode='23514',message='All active Trips must be Delivered first'; end if; update public.operational_jobs set status='completed',manually_completed_at=now(),manual_completion_reason=btrim(p_reason),completed_by_profile_id=v_actor,updated_at=now() where id=p_job returning * into v_job; update public.orders set execution_status='completed',scheduled_for=coalesce(scheduled_for,created_at),execution_started_at=coalesce(execution_started_at,created_at),completed_at=now(),updated_at=now() where id=v_job.order_id; perform private.write_operation_activity(p_job,null,'job_manually_completed',v_actor,jsonb_build_object('reason',btrim(p_reason))); return to_jsonb(v_job); end $$;

create or replace function public.operations_review_cancellation(p_request uuid,p_decision text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_req public.job_cancellation_requests%rowtype; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_decision not in ('approved','rejected') or p_reason is null or char_length(btrim(p_reason))<8 then raise exception using errcode='22023',message='Decision and reason are required'; end if; select * into v_req from public.job_cancellation_requests where id=p_request for update; if not found or v_req.status<>'pending' then raise exception using errcode='23514',message='Cancellation request is not pending'; end if; update public.job_cancellation_requests set status=p_decision,decided_at=now(),decided_by_profile_id=v_actor,internal_decision_reason=btrim(p_reason),updated_at=now() where id=p_request returning * into v_req; if p_decision='approved' then update public.operational_jobs set status='cancelled',cancelled_at=now(),cancellation_reason=btrim(p_reason),updated_at=now() where id=v_req.job_id and status not in ('completed','cancelled'); update public.orders o set execution_status='cancelled',updated_at=now() from public.operational_jobs j where j.id=v_req.job_id and o.id=j.order_id and o.execution_status<>'completed'; end if; perform private.write_operation_activity(v_req.job_id,null,case when p_decision='approved' then 'cancellation_approved' else 'cancellation_rejected' end,v_actor,'{}'::jsonb); return to_jsonb(v_req); end $$;

create or replace function public.operations_save_driver(p_driver uuid,p_name text,p_mobile text,p_relationship text,p_company uuid default null,p_status text default 'active') returns uuid language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_id uuid; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_driver is null then insert into public.drivers(display_name,mobile_number,relationship_type,external_company_id,status,created_by_profile_id) values(btrim(p_name),p_mobile,p_relationship,p_company,p_status,v_actor) returning id into v_id; else update public.drivers set display_name=btrim(p_name),mobile_number=p_mobile,relationship_type=p_relationship,external_company_id=p_company,status=p_status,updated_at=now(),updated_by_profile_id=v_actor where id=p_driver returning id into v_id; end if; if v_id is null then raise exception using errcode='P0002',message='Driver not found'; end if; return v_id; end $$;
create or replace function public.operations_save_vehicle(p_vehicle uuid,p_type text,p_plate text,p_provider text,p_company uuid default null,p_status text default 'active') returns uuid language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_id uuid; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_vehicle is null then insert into public.vehicles(vehicle_type,plate_number,provider_type,external_company_id,status,created_by_profile_id) values(btrim(p_type),upper(btrim(p_plate)),p_provider,p_company,p_status,v_actor) returning id into v_id; else update public.vehicles set vehicle_type=btrim(p_type),plate_number=upper(btrim(p_plate)),provider_type=p_provider,external_company_id=p_company,status=p_status,updated_at=now(),updated_by_profile_id=v_actor where id=p_vehicle returning id into v_id; end if; if v_id is null then raise exception using errcode='P0002',message='Vehicle not found'; end if; return v_id; end $$;
create or replace function public.operations_save_carrier(p_carrier uuid,p_name text,p_contact text default null,p_mobile text default null,p_email text default null,p_status text default 'active') returns uuid language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_id uuid; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_carrier is null then insert into public.external_transport_companies(company_name,contact_name,mobile_number,email,status,created_by_profile_id) values(btrim(p_name),nullif(btrim(p_contact),''),p_mobile,nullif(lower(btrim(p_email)),''),p_status,v_actor) returning id into v_id; else update public.external_transport_companies set company_name=btrim(p_name),contact_name=nullif(btrim(p_contact),''),mobile_number=p_mobile,email=nullif(lower(btrim(p_email)),''),status=p_status,updated_at=now(),updated_by_profile_id=v_actor where id=p_carrier returning id into v_id; end if; return v_id; end $$;

alter table public.external_transport_companies enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.operational_jobs enable row level security;
alter table public.trips enable row level security;
alter table public.trip_assignment_history enable row level security;
alter table public.job_tracking_accesses enable row level security;
alter table public.job_cancellation_requests enable row level security;

create policy rls_jobs__select__operations_reader on public.operational_jobs for select to authenticated using ((select public.has_permission('operations.workspace.read')));
create policy rls_trips__select__operations_reader on public.trips for select to authenticated using ((select public.has_permission('operations.workspace.read')));
create policy rls_drivers__select__operations_reader on public.drivers for select to authenticated using ((select public.has_permission('operations.workspace.read')));
create policy rls_vehicles__select__operations_reader on public.vehicles for select to authenticated using ((select public.has_permission('operations.workspace.read')));
create policy rls_carriers__select__operations_reader on public.external_transport_companies for select to authenticated using ((select public.has_permission('operations.workspace.read')));

revoke all on table public.external_transport_companies,public.drivers,public.vehicles,public.operational_jobs,public.trips,public.trip_assignment_history,public.job_tracking_accesses,public.job_cancellation_requests from public,anon,authenticated;
grant select on public.external_transport_companies,public.drivers,public.vehicles,public.operational_jobs,public.trips to authenticated;
grant all on public.external_transport_companies,public.drivers,public.vehicles,public.operational_jobs,public.trips,public.trip_assignment_history,public.job_tracking_accesses,public.job_cancellation_requests to service_role;

revoke all on function public.operations_list_jobs(int,int,text,text),public.operations_get_job(uuid),public.operations_create_trip(uuid),public.operations_save_trip(uuid,jsonb),public.operations_transition_trip(uuid,text,boolean,text),public.operations_set_trip_condition(uuid,text,text,text,text),public.operations_issue_tracking_access(uuid),public.operations_complete_job(uuid,text),public.operations_review_cancellation(uuid,text,text),public.operations_save_driver(uuid,text,text,text,uuid,text),public.operations_save_vehicle(uuid,text,text,text,uuid,text),public.operations_save_carrier(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.operations_list_jobs(int,int,text,text),public.operations_get_job(uuid),public.operations_create_trip(uuid),public.operations_save_trip(uuid,jsonb),public.operations_transition_trip(uuid,text,boolean,text),public.operations_set_trip_condition(uuid,text,text,text,text),public.operations_issue_tracking_access(uuid),public.operations_complete_job(uuid,text),public.operations_review_cancellation(uuid,text,text),public.operations_save_driver(uuid,text,text,text,uuid,text),public.operations_save_vehicle(uuid,text,text,text,uuid,text),public.operations_save_carrier(uuid,text,text,text,text,text) to authenticated;
revoke all on function public.customer_get_job_tracking(text),public.customer_recover_job_tracking(text,text),public.customer_confirm_job_receipt(text),public.customer_request_job_cancellation(text,text) from public,anon,authenticated;
grant execute on function public.customer_get_job_tracking(text),public.customer_recover_job_tracking(text,text),public.customer_confirm_job_receipt(text),public.customer_request_job_cancellation(text,text) to anon,authenticated;
revoke all on function private.require_operations_permission(text),private.write_operation_activity(uuid,uuid,text,uuid,jsonb),private.refresh_job_state(uuid),private.create_job_for_order(),private.issue_job_tracking_access(uuid,uuid),private.customer_job_payload(uuid) from public,anon,authenticated,service_role;

comment on table public.operational_jobs is 'One operational execution aggregate per commercial Order.';
comment on table public.trips is 'One of one-or-many physical journeys belonging to an operational Job.';
comment on table public.job_tracking_accesses is 'Hashed 256-bit guest capabilities; plaintext is returned once and never persisted.';

commit;
