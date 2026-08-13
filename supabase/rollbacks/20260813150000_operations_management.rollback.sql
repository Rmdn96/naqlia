begin;

do $$
begin
  if exists (select 1 from public.trips)
    or exists (select 1 from public.job_tracking_accesses)
    or exists (select 1 from public.job_cancellation_requests)
  then
    raise exception 'Rollback refused: operational execution or customer capability evidence exists';
  end if;
end $$;

drop trigger if exists trg_orders__after_insert__create_job on public.orders;
drop function if exists public.operations_save_carrier(uuid,text,text,text,text,text);
drop function if exists public.operations_save_vehicle(uuid,text,text,text,uuid,text);
drop function if exists public.operations_save_driver(uuid,text,text,text,uuid,text);
drop function if exists public.operations_review_cancellation(uuid,text,text);
drop function if exists public.operations_complete_job(uuid,text);
drop function if exists public.customer_request_job_cancellation(text,text);
drop function if exists public.customer_confirm_job_receipt(text);
drop function if exists public.customer_recover_job_tracking(text,text);
drop function if exists public.customer_get_job_tracking(text);
drop function if exists private.customer_job_payload(uuid);
drop function if exists public.operations_issue_tracking_access(uuid);
drop function if exists private.issue_job_tracking_access(uuid,uuid);
drop function if exists public.operations_set_trip_condition(uuid,text,text,text,text);
drop function if exists public.operations_transition_trip(uuid,text,boolean,text);
drop function if exists public.operations_save_trip(uuid,jsonb);
drop function if exists public.operations_create_trip(uuid);
drop function if exists public.operations_get_job(uuid);
drop function if exists public.operations_list_jobs(int,int,text,text);
drop function if exists private.create_job_for_order();
drop function if exists private.refresh_job_state(uuid);
drop function if exists private.write_operation_activity(uuid,uuid,text,uuid,jsonb);
drop function if exists private.require_operations_permission(text);

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check (event_key in (
 'lead_created','lead_viewed','lead_qualified','lead_quoted','lead_order_ready','lead_closed','lead_cancelled',
 'quotation_draft_created','quotation_draft_updated','quotation_sent','quotation_approved','quotation_rejected','quotation_expired','quotation_superseded','quotation_cancelled',
 'customer_quotation_access_issued','customer_quotation_viewed','customer_accepted_quotation','customer_rejected_quotation','order_created_from_quotation','customer_access_revoked'
));
alter table public.lead_activity_logs drop column trip_id, drop column job_id;

drop table public.job_cancellation_requests;
drop table public.job_tracking_accesses;
drop table public.trip_assignment_history;
drop table public.trips;
drop table public.operational_jobs;
drop table public.vehicles;
drop table public.drivers;
drop table public.external_transport_companies;

delete from public.role_permissions where permission_id in (select id from public.permissions where permission_key in ('operations.workspace.read','operations.workspace.manage'));
delete from public.permissions where permission_key in ('operations.workspace.read','operations.workspace.manage');

commit;
