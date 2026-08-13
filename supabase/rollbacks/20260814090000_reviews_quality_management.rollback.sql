begin;

do $$
begin
  if exists (select 1 from public.job_reviews limit 1) then
    raise exception 'Rollback refused: Reviews exist and must be preserved or exported first';
  end if;
end $$;

revoke all on function public.customer_get_job_review(text),public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb) from public,anon,authenticated;
revoke all on function public.quality_list_reviews(integer,integer,integer,text,text),public.quality_get_review(uuid),public.quality_set_review_publication(uuid,text),public.quality_update_alert(uuid,text,text,text) from public,anon,authenticated;
drop function if exists public.customer_get_job_review(text);
drop function if exists public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb);
drop function if exists public.quality_list_reviews(integer,integer,integer,text,text);
drop function if exists public.quality_get_review(uuid);
drop function if exists public.quality_set_review_publication(uuid,text);
drop function if exists public.quality_update_alert(uuid,text,text,text);
drop function if exists private.review_customer_payload(uuid);
drop function if exists private.review_customer_context(text,boolean);
drop function if exists private.require_quality_permission(text);

drop table if exists public.quality_alert_notes;
drop table if exists public.quality_alerts;
drop table if exists public.review_driver_ratings;
drop table if exists public.job_reviews;

delete from public.role_permissions rp using public.permissions p where rp.permission_id=p.id and p.permission_key like 'quality.%';
delete from public.permissions where permission_key like 'quality.%';

alter table public.lead_activity_logs drop constraint if exists ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check (event_key in (
 'lead_created','lead_viewed','lead_qualified','lead_quoted','lead_order_ready','lead_closed','lead_cancelled',
 'quotation_draft_created','quotation_draft_updated','quotation_sent','quotation_approved','quotation_rejected','quotation_expired','quotation_superseded','quotation_cancelled',
 'customer_quotation_access_issued','customer_quotation_viewed','customer_accepted_quotation','customer_rejected_quotation','order_created_from_quotation','customer_access_revoked',
 'job_created','trip_created','trip_scheduled','trip_schedule_updated','driver_assigned','driver_changed','vehicle_assigned','vehicle_changed','workers_count_changed','schedule_conflict_overridden',
 'trip_status_changed','trip_state_overridden','trip_condition_recorded','trip_condition_resolved','expected_timing_updated','tracking_access_issued','tracking_access_revoked',
 'cancellation_requested','cancellation_approved','cancellation_rejected','customer_confirmed_receipt','job_manually_completed'
));

commit;
