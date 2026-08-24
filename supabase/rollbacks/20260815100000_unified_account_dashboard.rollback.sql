begin;

do $$
begin
  if exists(select 1 from public.customer_accounts)
    or exists(select 1 from public.customer_account_leads)
    or exists(select 1 from public.staff_notification_reads)
    or exists(select 1 from public.staff_invitations)
    or exists(select 1 from public.lead_activity_logs where lead_id is null)
  then
    raise exception 'Rollback refused: unified account or Staff Portal data exists';
  end if;
end $$;

drop policy if exists rls_customer_accounts__select__self on public.customer_accounts;
drop policy if exists rls_customer_account_leads__select__self on public.customer_account_leads;
drop policy if exists rls_notification_reads__select__self on public.staff_notification_reads;
drop policy if exists rls_business_settings__select__manager on public.business_settings;
drop policy if exists rls_staff_invitations__select__administrator on public.staff_invitations;

drop function if exists public.admin_list_activity(text,text,text,timestamptz,timestamptz,integer,integer);
drop function if exists public.admin_list_roles_permissions();
drop function if exists public.admin_list_users(text,text,text,integer,integer);
drop function if exists public.admin_cancel_staff_invitation(uuid,text);
drop function if exists public.admin_mark_invitation_resent(uuid);
drop function if exists public.admin_register_staff_invitation(uuid,text,text,text);
drop function if exists public.admin_set_staff_access(uuid,boolean,text);
drop function if exists public.admin_set_staff_role(uuid,text,text);
drop function if exists public.admin_update_service_area(uuid,text,integer);
drop function if exists public.admin_update_business_setting(text,text);
drop function if exists public.admin_list_business_settings();
drop function if exists public.portal_mark_notifications_read(uuid);
drop function if exists public.portal_list_notifications(integer);
drop function if exists private.portal_activity_visible(text);
drop function if exists public.portal_global_search(text);
drop function if exists public.portal_get_dashboard();
drop function if exists public.portal_get_context();
drop function if exists public.get_public_business_settings();
drop function if exists public.account_get_job_tracking(uuid);
drop function if exists public.account_issue_job_tracking_access(uuid);
drop function if exists public.account_get_dashboard();
drop function if exists public.account_link_submission(uuid);
drop function if exists public.account_claim_request(text,text);
drop function if exists private.link_customer_lead(uuid,uuid,text,uuid);
drop function if exists public.account_update_profile(text,text,text);
drop function if exists public.resolve_identity_context();
drop function if exists private.write_platform_activity(text,text,text,uuid,uuid,jsonb);
drop function if exists private.require_portal_permission(text);
drop function if exists private.current_customer_account_id();
drop trigger if exists trg_profiles__before_update__protect_staff_access on public.profiles;
drop function if exists private.protect_staff_access_invariants();
drop function if exists public.provision_staff_identity(uuid,text,text,text);

drop table if exists public.staff_invitations;
drop table if exists public.business_settings;
drop table if exists public.staff_notification_reads;
drop table if exists public.customer_account_leads;
drop table if exists public.customer_accounts;

delete from public.role_permissions
where permission_id in (
  select id from public.permissions where permission_key in (
    'portal.dashboard.read','portal.search.read','portal.notifications.read','settings.business.read',
    'settings.business.manage','administration.users.read','administration.users.manage',
    'administration.audit.read','finance.dashboard.read'
  )
);
delete from public.permissions where permission_key in (
  'portal.dashboard.read','portal.search.read','portal.notifications.read','settings.business.read',
  'settings.business.manage','administration.users.read','administration.users.manage',
  'administration.audit.read','finance.dashboard.read'
);

alter table public.lead_activity_logs drop constraint if exists ck_lead_activity_logs__scope;
alter table public.lead_activity_logs drop constraint if exists ck_lead_activity_logs__functional_area;
alter table public.lead_activity_logs drop column if exists subject_id;
alter table public.lead_activity_logs drop column if exists subject_type;
alter table public.lead_activity_logs drop column if exists functional_area;
alter table public.lead_activity_logs alter column lead_id set not null;
alter table public.lead_activity_logs drop constraint if exists ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check (event_key in (
  'lead_created','lead_viewed','lead_qualified','lead_quoted','lead_order_ready','lead_closed','lead_cancelled',
  'quotation_draft_created','quotation_draft_updated','quotation_sent','quotation_approved','quotation_rejected','quotation_expired','quotation_superseded','quotation_cancelled',
  'customer_quotation_access_issued','customer_quotation_viewed','customer_accepted_quotation','customer_rejected_quotation','order_created_from_quotation','customer_access_revoked',
  'job_created','trip_created','trip_scheduled','trip_schedule_updated','driver_assigned','driver_changed','vehicle_assigned','vehicle_changed','workers_count_changed','schedule_conflict_overridden',
  'trip_status_changed','trip_state_overridden','trip_condition_recorded','trip_condition_resolved','expected_timing_updated','tracking_access_issued','tracking_access_revoked',
  'cancellation_requested','cancellation_approved','cancellation_rejected','customer_confirmed_receipt','job_manually_completed',
  'review_submitted','review_updated','publication_consent_changed','review_publication_approved','review_unpublished','review_featured','review_unfeatured',
  'quality_alert_created','quality_alert_status_changed','quality_alert_resolved'
));

create or replace function private.has_permission_authoritative(requested_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    join public.profile_roles on profile_roles.profile_id=profiles.id and profile_roles.status='active'
    join public.roles on roles.id=profile_roles.role_id and roles.status='active'
    join public.role_permissions on role_permissions.role_id=roles.id and role_permissions.status='active'
    join public.permissions on permissions.id=role_permissions.permission_id and permissions.status='active'
    where profiles.auth_user_id=auth.uid() and profiles.profile_kind='staff'
      and profiles.status='active' and permissions.permission_key=requested_permission
  )
$$;

create or replace function public.provision_staff_identity(target_auth_user_id uuid,target_role_key text,target_display_name text,change_reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare assignment_id uuid; existing_role_id uuid; profile_kind text; profile_status text; selected_role_id uuid; target_profile_record_id uuid;
begin
  if auth.role()<>'service_role' then raise exception using errcode='42501',message='Not authorized'; end if;
  if char_length(btrim(target_display_name)) not between 2 and 120 or char_length(btrim(change_reason)) not between 8 and 500 then
    raise exception using errcode='22023',message='Valid identity data is required';
  end if;
  select id,profiles.profile_kind,profiles.status into target_profile_record_id,profile_kind,profile_status
    from public.profiles where auth_user_id=target_auth_user_id for update;
  if target_profile_record_id is null or profile_status='closed' then raise exception using errcode='22023',message='Authentication profile is not eligible'; end if;
  if profile_kind='customer' and profile_status<>'pending' then raise exception using errcode='22023',message='An established customer identity cannot become a workforce identity'; end if;
  select id into selected_role_id from public.roles where role_key=target_role_key and status='active';
  if selected_role_id is null then raise exception using errcode='22023',message='Target role is not active'; end if;
  select id,role_id into assignment_id,existing_role_id from public.profile_roles where profile_id=target_profile_record_id and status='active' for update;
  if existing_role_id=selected_role_id and profile_status='active' then update public.profiles set display_name=btrim(target_display_name) where id=target_profile_record_id; return assignment_id; end if;
  update public.profiles set profile_kind='staff',status='suspended',display_name=btrim(target_display_name),status_reason='Staff provisioning in progress' where id=target_profile_record_id;
  update public.profile_roles set status='revoked',revoked_at=now(),revocation_reason=change_reason where profile_id=target_profile_record_id and status='active';
  insert into public.profile_roles(profile_id,role_id,status,grant_reason) values(target_profile_record_id,selected_role_id,'active',change_reason) returning id into assignment_id;
  update public.profiles set status='active',status_reason=change_reason where id=target_profile_record_id;
  return assignment_id;
end $$;

alter table public.profiles drop column if exists last_login_at;
alter table public.profiles drop column if exists staff_access_status;

revoke all on function private.has_permission_authoritative(text) from public,anon,authenticated;
grant execute on function private.has_permission_authoritative(text) to authenticated,service_role;
revoke all on function public.provision_staff_identity(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.provision_staff_identity(uuid,text,text,text) to service_role;

commit;
