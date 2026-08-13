begin;

drop function if exists private.sync_order_execution(uuid, text);

create or replace function private.refresh_job_state(p_job uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_state text; v_total int; v_delivered int; v_active int; v_scheduled int; v_attention boolean;
begin
 select count(*),count(*) filter(where status='delivered'),count(*) filter(where status in ('confirmed','en_route_pickup','loading','in_transit','arrived')),count(*) filter(where status<>'unscheduled'),bool_or(condition<>'normal')
 into v_total,v_delivered,v_active,v_scheduled,v_attention from public.trips where job_id=p_job and status<>'cancelled';
 select status into v_state from public.operational_jobs where id=p_job for update;
 if v_state in ('completed','cancelled') then return v_state; end if;
 v_state:=case when v_total=0 then 'unscheduled' when v_delivered=v_total then 'awaiting_customer_confirmation' when v_active>0 or v_delivered>0 then 'in_progress' when v_scheduled>0 then 'scheduled' else 'unscheduled' end;
 update public.operational_jobs set status=v_state,attention_required=coalesce(v_attention,false),updated_at=now() where id=p_job;
 return v_state;
end $$;

create or replace function public.customer_confirm_job_receipt(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_access public.job_tracking_accesses%rowtype; v_job public.operational_jobs%rowtype; begin if p_token is null or p_token!~'^[a-f0-9]{64}$' then return jsonb_build_object('state','invalid'); end if; select * into v_access from public.job_tracking_accesses where token_hash=extensions.digest(p_token,'sha256') and status='active' and expires_at>now() for update; if not found then return jsonb_build_object('state','invalid'); end if; select * into v_job from public.operational_jobs where id=v_access.job_id for update; if v_job.status='completed' then return jsonb_build_object('state','completed','confirmed_at',v_job.customer_confirmed_at); end if; if v_job.status<>'awaiting_customer_confirmation' then return jsonb_build_object('state','not_eligible'); end if; update public.operational_jobs set status='completed',customer_confirmed_at=now(),updated_at=now() where id=v_job.id returning * into v_job; update public.orders set execution_status='completed',scheduled_for=coalesce(scheduled_for,created_at),execution_started_at=coalesce(execution_started_at,created_at),completed_at=now(),updated_at=now() where id=v_job.order_id; perform private.write_operation_activity(v_job.id,null,'customer_confirmed_receipt',null,'{}'::jsonb); return jsonb_build_object('state','completed','confirmed_at',v_job.customer_confirmed_at); end $$;

create or replace function public.operations_complete_job(p_job uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$ declare v_actor uuid; v_job public.operational_jobs%rowtype; begin v_actor:=private.require_operations_permission('operations.workspace.manage'); if p_reason is null or char_length(btrim(p_reason))<8 then raise exception using errcode='22023',message='Manual completion reason is required'; end if; select * into v_job from public.operational_jobs where id=p_job for update; if v_job.status<>'awaiting_customer_confirmation' then raise exception using errcode='23514',message='All active Trips must be Delivered first'; end if; update public.operational_jobs set status='completed',manually_completed_at=now(),manual_completion_reason=btrim(p_reason),completed_by_profile_id=v_actor,updated_at=now() where id=p_job returning * into v_job; update public.orders set execution_status='completed',scheduled_for=coalesce(scheduled_for,created_at),execution_started_at=coalesce(execution_started_at,created_at),completed_at=now(),updated_at=now() where id=v_job.order_id; perform private.write_operation_activity(p_job,null,'job_manually_completed',v_actor,jsonb_build_object('reason',btrim(p_reason))); return to_jsonb(v_job); end $$;

revoke all on function private.refresh_job_state(uuid)
from public, anon, authenticated, service_role;
revoke all on function public.customer_confirm_job_receipt(text)
from public, anon, authenticated;
revoke all on function public.operations_complete_job(uuid, text)
from public, anon, authenticated;
grant execute on function public.customer_confirm_job_receipt(text) to anon, authenticated;
grant execute on function public.operations_complete_job(uuid, text) to authenticated;

commit;
