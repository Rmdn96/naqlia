begin;

alter table public.profiles
  add column staff_access_status text not null default 'not_staff',
  add column last_login_at timestamptz;

alter table public.profiles
  add constraint ck_profiles__staff_access_status
    check (staff_access_status in ('not_staff','active','inactive'));

update public.profiles p
set staff_access_status = case
  when exists (
    select 1 from public.profile_roles pr
    where pr.profile_id=p.id and pr.status='active'
  ) and p.status='active' then 'active'
  when p.profile_kind='staff' then 'inactive'
  else 'not_staff'
end;

create table public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  mobile_number text,
  mobile_verified_at timestamptz,
  preferred_locale text not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint uq_customer_accounts__profile unique(profile_id),
  constraint ck_customer_accounts__mobile check (
    mobile_number is null or mobile_number ~ '^\+9665[0-9]{8}$'
  ),
  constraint ck_customer_accounts__mobile_verification check (
    mobile_verified_at is null or mobile_number is not null
  ),
  constraint ck_customer_accounts__locale check (preferred_locale in ('ar','en')),
  constraint ck_customer_accounts__version check (version > 0)
);

create table public.customer_account_leads (
  id uuid primary key default gen_random_uuid(),
  customer_account_id uuid not null references public.customer_accounts(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  claim_method text not null,
  capability_source_id uuid,
  claimed_at timestamptz not null default now(),
  claimed_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  constraint uq_customer_account_leads__lead unique(lead_id),
  constraint uq_customer_account_leads__account_lead unique(customer_account_id,lead_id),
  constraint ck_customer_account_leads__method check (
    claim_method in ('authenticated_submission','quotation_capability','tracking_capability')
  ),
  constraint ck_customer_account_leads__capability check (
    (claim_method='authenticated_submission' and capability_source_id is null)
    or (claim_method<>'authenticated_submission' and capability_source_id is not null)
  )
);

alter table public.lead_activity_logs alter column lead_id drop not null;
alter table public.lead_activity_logs
  add column functional_area text not null default 'sales',
  add column subject_type text,
  add column subject_id uuid;

update public.lead_activity_logs set functional_area = case
  when event_key like 'quotation_%' or event_key like 'customer_%quotation%' then 'sales'
  when event_key like 'trip_%' or event_key like 'job_%' or event_key like 'tracking_%'
    or event_key like 'cancellation_%' or event_key='customer_confirmed_receipt' then 'operations'
  when event_key like 'review_%' or event_key like 'quality_%'
    or event_key='publication_consent_changed' then 'quality'
  else 'sales'
end;

alter table public.lead_activity_logs
  add constraint ck_lead_activity_logs__functional_area check (
    functional_area in ('sales','operations','quality','settings','administration','account')
  ),
  add constraint ck_lead_activity_logs__scope check (
    lead_id is not null or (subject_type is not null and subject_id is not null)
  );

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check (event_key in (
  'lead_created','lead_viewed','lead_qualified','lead_quoted','lead_order_ready','lead_closed','lead_cancelled',
  'quotation_draft_created','quotation_draft_updated','quotation_sent','quotation_approved','quotation_rejected','quotation_expired','quotation_superseded','quotation_cancelled',
  'customer_quotation_access_issued','customer_quotation_viewed','customer_accepted_quotation','customer_rejected_quotation','order_created_from_quotation','customer_access_revoked',
  'job_created','trip_created','trip_scheduled','trip_schedule_updated','driver_assigned','driver_changed','vehicle_assigned','vehicle_changed','workers_count_changed','schedule_conflict_overridden',
  'trip_status_changed','trip_state_overridden','trip_condition_recorded','trip_condition_resolved','expected_timing_updated','tracking_access_issued','tracking_access_revoked',
  'cancellation_requested','cancellation_approved','cancellation_rejected','customer_confirmed_receipt','job_manually_completed',
  'review_submitted','review_updated','publication_consent_changed','review_publication_approved','review_unpublished','review_featured','review_unfeatured',
  'quality_alert_created','quality_alert_status_changed','quality_alert_resolved',
  'customer_account_created','customer_account_updated','customer_account_linked',
  'business_setting_changed','service_area_changed','staff_invited','staff_invitation_resent','staff_invitation_cancelled',
  'staff_role_changed','staff_deactivated','staff_reactivated'
));

create table public.staff_notification_reads (
  profile_id uuid not null references public.profiles(id) on delete restrict,
  activity_log_id uuid not null references public.lead_activity_logs(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(profile_id,activity_log_id)
);

create table public.business_settings (
  setting_key text primary key,
  category text not null,
  value_text text,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  version integer not null default 1,
  constraint ck_business_settings__key check (setting_key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  constraint ck_business_settings__category check (category in ('contact','social','customer','quotation','identity')),
  constraint ck_business_settings__value check (value_text is null or char_length(value_text) <= 2000),
  constraint ck_business_settings__version check (version > 0)
);

create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  email text not null,
  display_name text not null,
  role_id uuid not null references public.roles(id) on delete restrict,
  status text not null default 'pending',
  invited_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  invited_at timestamptz not null default now(),
  last_sent_at timestamptz not null default now(),
  resend_count integer not null default 0,
  accepted_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by_profile_id uuid references public.profiles(id) on delete restrict,
  cancellation_reason text,
  constraint ck_staff_invitations__email check (email=lower(email) and char_length(email) between 3 and 254),
  constraint ck_staff_invitations__display check (char_length(btrim(display_name)) between 2 and 120),
  constraint ck_staff_invitations__status check (status in ('pending','accepted','cancelled')),
  constraint ck_staff_invitations__resend check (resend_count between 0 and 50),
  constraint ck_staff_invitations__state check (
    (status='pending' and accepted_at is null and cancelled_at is null and cancelled_by_profile_id is null and cancellation_reason is null)
    or (status='accepted' and accepted_at is not null and cancelled_at is null and cancelled_by_profile_id is null and cancellation_reason is null)
    or (status='cancelled' and accepted_at is null and cancelled_at is not null and cancelled_by_profile_id is not null and char_length(btrim(cancellation_reason)) between 8 and 500)
  )
);

create unique index uq_staff_invitations__pending_email
  on public.staff_invitations(lower(email)) where status='pending';
create index idx_customer_account_leads__account_claimed
  on public.customer_account_leads(customer_account_id,claimed_at desc);
create index idx_customer_account_leads__profile
  on public.customer_account_leads(claimed_by_profile_id);
create index idx_staff_notification_reads__activity
  on public.staff_notification_reads(activity_log_id);
create index idx_lead_activity_logs__area_occurred
  on public.lead_activity_logs(functional_area,occurred_at desc);
create index idx_lead_activity_logs__actor_occurred
  on public.lead_activity_logs(actor_profile_id,occurred_at desc) where actor_profile_id is not null;
create index idx_lead_activity_logs__event_occurred
  on public.lead_activity_logs(event_key,occurred_at desc);
create index idx_business_settings__category
  on public.business_settings(category,setting_key);
create index idx_staff_invitations__status_sent
  on public.staff_invitations(status,last_sent_at desc);
create index idx_staff_invitations__auth_user_sent
  on public.staff_invitations(auth_user_id,invited_at desc);
create index idx_staff_invitations__role
  on public.staff_invitations(role_id,status);

insert into public.permissions(permission_key,description_ar,description_en,risk_level,status)
values
 ('portal.dashboard.read','عرض لوحة العمل الموحدة حسب الدور','Read the role-aware unified work dashboard','low','active'),
 ('portal.search.read','البحث المصرح به في مراجع الأعمال','Search authorized business references','medium','active'),
 ('portal.notifications.read','عرض وإدارة حالة قراءة تنبيهات العمل','Read role-aware work notifications','low','active'),
 ('settings.business.read','عرض إعدادات الأعمال غير السرية','Read non-secret business settings','medium','active'),
 ('settings.business.manage','تعديل إعدادات الأعمال غير السرية','Manage non-secret business settings','critical','active'),
 ('administration.users.read','عرض مستخدمي وأدوار المنصة','Read platform users and roles','high','active'),
 ('administration.users.manage','إدارة دعوات الموظفين ودورة حياتهم','Manage staff invitations and lifecycle','critical','active'),
 ('administration.audit.read','عرض سجل نشاط المنصة المحمي','Read the protected platform activity log','high','active'),
 ('finance.dashboard.read','عرض المؤشرات التجارية المعتمدة الحالية','Read currently approved commercial indicators','medium','active')
on conflict(permission_key) do update set
 description_ar=excluded.description_ar,description_en=excluded.description_en,
 risk_level=excluded.risk_level,status='active',updated_at=now();

insert into public.role_permissions(role_id,permission_id,status,grant_reason)
select r.id,p.id,'active','Unified portal v1 approved role grant'
from public.roles r cross join public.permissions p
where
 (p.permission_key in ('portal.dashboard.read','portal.notifications.read') and r.role_key in ('super_admin','sales','operations','finance','customer_service'))
 or (p.permission_key='portal.search.read' and r.role_key in ('super_admin','sales','operations','finance','customer_service'))
 or (p.permission_key in ('settings.business.read','settings.business.manage','administration.users.read','administration.users.manage','administration.audit.read') and r.role_key='super_admin')
 or (p.permission_key='finance.dashboard.read' and r.role_key in ('super_admin','finance'))
on conflict(role_id,permission_id) where status='active' do nothing;

insert into public.business_settings(setting_key,category,value_text,is_public)
values
 ('contact.whatsapp','contact','966547349947',true),
 ('contact.phone','contact',null,true),
 ('contact.email','contact',null,true),
 ('contact.address_ar','contact',null,true),
 ('contact.address_en','contact',null,true),
 ('contact.working_hours_ar','contact',null,true),
 ('contact.working_hours_en','contact',null,true),
 ('social.instagram','social',null,true),
 ('social.x','social',null,true),
 ('social.tiktok','social',null,true),
 ('customer.google_review_url','customer',null,true),
 ('customer.review_edit_window_days','customer',null,false),
 ('customer.driver_contact_visibility_hours','customer',null,false),
 ('quotation.default_validity_days','quotation','7',true),
 ('identity.name_ar','identity','نقلك',true),
 ('identity.name_en','identity','Naqlk',true),
 ('identity.description_ar','identity','نقلك... ننقل كل ما يهمك',true),
 ('identity.description_en','identity','Your move. Everything that matters.',true)
on conflict(setting_key) do nothing;

create or replace function private.current_customer_account_id()
returns uuid language sql stable security definer set search_path='' as $$
  select ca.id from public.customer_accounts ca
  join public.profiles p on p.id=ca.profile_id
  where p.auth_user_id=auth.uid() and p.status='active'
  limit 1
$$;

create or replace function private.require_portal_permission(p_permission text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_profile uuid;
begin
  if auth.role()<>'authenticated' or not private.has_permission_authoritative(p_permission) then
    raise exception using errcode='42501',message='Portal permission is required';
  end if;
  v_profile:=private.current_profile_id_authoritative();
  if v_profile is null then raise exception using errcode='42501',message='Active profile is required'; end if;
  return v_profile;
end $$;

create or replace function private.write_platform_activity(
  p_area text,p_event text,p_subject_type text,p_subject_id uuid,p_actor uuid,p_details jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if p_area not in ('settings','administration','account') or p_details::text ~* '(token|password|secret|session|magic.?link)' then
    raise exception using errcode='22023',message='Unsafe platform activity';
  end if;
  insert into public.lead_activity_logs(lead_id,event_key,actor_profile_id,details,occurred_at,functional_area,subject_type,subject_id)
  values(null,p_event,p_actor,coalesce(p_details,'{}'::jsonb),now(),p_area,p_subject_type,p_subject_id)
  returning id into v_id;
  return v_id;
end $$;

create or replace function private.has_permission_authoritative(requested_permission text)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.profiles p
    join public.profile_roles pr on pr.profile_id=p.id and pr.status='active'
    join public.roles r on r.id=pr.role_id and r.status='active'
    join public.role_permissions rp on rp.role_id=r.id and rp.status='active'
    join public.permissions pm on pm.id=rp.permission_id and pm.status='active'
    where p.auth_user_id=auth.uid() and p.profile_kind='staff' and p.status='active'
      and p.staff_access_status='active' and pm.permission_key=requested_permission
  )
$$;

create or replace function private.protect_staff_access_invariants()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_role text; v_other integer;
begin
  if new.staff_access_status='active' then
    if new.profile_kind<>'staff' or new.status<>'active' or not exists(
      select 1 from public.profile_roles where profile_id=new.id and status='active'
    ) then raise exception using errcode='23514',message='Active staff access requires an active staff profile and role'; end if;
  end if;
  if old.staff_access_status='active' and new.staff_access_status<>'active' then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('last-super-admin',0));
    select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id
      where pr.profile_id=old.id and pr.status='active';
    if v_role='super_admin' then
      select count(*) into v_other from public.profiles p
      join public.profile_roles pr on pr.profile_id=p.id and pr.status='active'
      join public.roles r on r.id=pr.role_id and r.role_key='super_admin'
      where p.id<>old.id and p.status='active' and p.staff_access_status='active';
      if v_other=0 then raise exception using errcode='23514',message='The last active Super Admin cannot be deactivated'; end if;
    end if;
  end if;
  return new;
end $$;

create trigger trg_profiles__before_update__protect_staff_access
before update of staff_access_status on public.profiles
for each row execute function private.protect_staff_access_invariants();

create or replace function public.resolve_identity_context()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_profile public.profiles%rowtype; v_account uuid; v_role text; v_permissions jsonb;
begin
  if auth.role()<>'authenticated' or v_uid is null then raise exception using errcode='42501',message='Authentication required'; end if;
  select * into v_profile from public.profiles where auth_user_id=v_uid for update;
  if not found then
    insert into public.profiles(auth_user_id,profile_kind,status,preferred_locale)
    values(v_uid,'customer','active',case when auth.jwt()->'user_metadata'->>'preferred_locale' in ('ar','en') then auth.jwt()->'user_metadata'->>'preferred_locale' else 'ar' end)
    returning * into v_profile;
  elsif v_profile.profile_kind='customer' and v_profile.status='pending' then
    update public.profiles set status='active',status_reason=null,last_login_at=now() where id=v_profile.id returning * into v_profile;
  elsif v_profile.status='active' then
    update public.profiles set last_login_at=now() where id=v_profile.id returning * into v_profile;
  end if;
  if v_profile.status<>'active' then return jsonb_build_object('state','inactive'); end if;
  insert into public.customer_accounts(profile_id,preferred_locale)
    values(v_profile.id,v_profile.preferred_locale) on conflict(profile_id) do update set updated_at=public.customer_accounts.updated_at
    returning id into v_account;
  if v_account is null then select id into v_account from public.customer_accounts where profile_id=v_profile.id; end if;
  select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id and r.status='active'
    where pr.profile_id=v_profile.id and pr.status='active' and v_profile.staff_access_status='active';
  select coalesce(jsonb_agg(pm.permission_key order by pm.permission_key),'[]'::jsonb) into v_permissions
    from public.profile_roles pr join public.role_permissions rp on rp.role_id=pr.role_id and rp.status='active'
    join public.permissions pm on pm.id=rp.permission_id and pm.status='active'
    where pr.profile_id=v_profile.id and pr.status='active' and v_profile.staff_access_status='active';
  update public.staff_invitations set status='accepted',accepted_at=now()
    where auth_user_id=v_uid and status='pending';
  return jsonb_build_object('state','active','profile_id',v_profile.id,'customer_account_id',v_account,
    'is_staff',v_role is not null,'role_key',v_role,'permissions',v_permissions,
    'preferred_locale',v_profile.preferred_locale,'display_name',v_profile.display_name);
end $$;

create or replace function public.account_update_profile(p_display_name text,p_mobile text,p_locale text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid; v_profile uuid; v_mobile text:=nullif(regexp_replace(coalesce(p_mobile,''),'[^0-9]','','g'),'');
begin
  v_account:=private.current_customer_account_id();
  if v_account is null then raise exception using errcode='42501',message='Customer account required'; end if;
  if char_length(btrim(p_display_name)) not between 2 and 120 or p_locale not in ('ar','en') then raise exception using errcode='22023',message='Invalid profile'; end if;
  if v_mobile is not null then
    v_mobile:=case when v_mobile~'^05[0-9]{8}$' then '+966'||substr(v_mobile,2) when v_mobile~'^9665[0-9]{8}$' then '+'||v_mobile else null end;
    if v_mobile is null then raise exception using errcode='22023',message='Invalid mobile'; end if;
  end if;
  select profile_id into v_profile from public.customer_accounts where id=v_account for update;
  update public.profiles set display_name=btrim(p_display_name),preferred_locale=p_locale where id=v_profile;
  update public.customer_accounts set mobile_number=v_mobile,
    mobile_verified_at=case when mobile_number is distinct from v_mobile then null else mobile_verified_at end,
    preferred_locale=p_locale,updated_at=now(),version=version+1 where id=v_account;
  perform private.write_platform_activity('account','customer_account_updated','customer_account',v_account,v_profile,'{}'::jsonb);
  return jsonb_build_object('state','updated');
end $$;

create or replace function private.link_customer_lead(p_account uuid,p_lead uuid,p_method text,p_source uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_existing uuid; v_profile uuid; v_pickup uuid; v_delivery uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('account-lead:'||p_lead::text,0));
  select customer_account_id into v_existing from public.customer_account_leads where lead_id=p_lead for update;
  if v_existing is not null and v_existing<>p_account then return 'invalid'; end if;
  select profile_id into v_profile from public.customer_accounts where id=p_account;
  insert into public.customer_account_leads(customer_account_id,lead_id,claim_method,capability_source_id,claimed_by_profile_id)
    values(p_account,p_lead,p_method,p_source,v_profile) on conflict(lead_id) do nothing;
  select pickup_address_id,delivery_address_id into v_pickup,v_delivery from public.leads where id=p_lead;
  update public.leads set profile_id=coalesce(profile_id,v_profile) where id=p_lead and (profile_id is null or profile_id=v_profile);
  if not found then return 'invalid'; end if;
  update public.addresses set profile_id=coalesce(profile_id,v_profile) where id in (v_pickup,v_delivery) and (profile_id is null or profile_id=v_profile);
  insert into public.lead_activity_logs(lead_id,event_key,actor_profile_id,details,occurred_at,functional_area)
    values(p_lead,'customer_account_linked',v_profile,jsonb_build_object('claim_method',p_method),now(),'account');
  return 'linked';
end $$;

create or replace function public.account_claim_request(p_capability_type text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid; v_lead uuid; v_source uuid; v_result text;
begin
  v_account:=private.current_customer_account_id();
  if v_account is null or p_token is null or p_token!~'^[a-f0-9]{64}$' or p_capability_type not in ('quotation','tracking') then
    return jsonb_build_object('state','invalid');
  end if;
  if p_capability_type='quotation' then
    select q.lead_id,a.id into v_lead,v_source from public.quotation_customer_accesses a
      join public.quotations q on q.id=a.quotation_id
      where a.token_hash=extensions.digest(p_token,'sha256') and a.status in ('active','responded')
        and a.revoked_at is null and a.expires_at>now() for update of a;
  else
    select q.lead_id,a.id into v_lead,v_source from public.job_tracking_accesses a
      join public.operational_jobs j on j.id=a.job_id join public.orders o on o.id=j.order_id
      join public.quotations q on q.id=o.quotation_id
      where a.token_hash=extensions.digest(p_token,'sha256') and a.status='active'
        and a.expires_at>now() for update of a;
  end if;
  if v_lead is null then return jsonb_build_object('state','invalid'); end if;
  v_result:=private.link_customer_lead(v_account,v_lead,p_capability_type||'_capability',v_source);
  return jsonb_build_object('state',v_result);
end $$;

create or replace function public.account_link_submission(p_submission_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid; v_lead uuid; v_result text;
begin
  v_account:=private.current_customer_account_id();
  if v_account is null or p_submission_key is null then return jsonb_build_object('state','invalid'); end if;
  select id into v_lead from public.leads where submission_key=p_submission_key and source='web' for update;
  if v_lead is null then return jsonb_build_object('state','invalid'); end if;
  v_result:=private.link_customer_lead(v_account,v_lead,'authenticated_submission',null);
  return jsonb_build_object('state',v_result);
end $$;

create or replace function public.account_get_dashboard()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid; v_profile uuid; v_email text; v_verified boolean; v_result jsonb;
begin
  v_account:=private.current_customer_account_id();
  if v_account is null then raise exception using errcode='42501',message='Customer account required'; end if;
  select ca.profile_id,u.email,u.email_confirmed_at is not null into v_profile,v_email,v_verified
    from public.customer_accounts ca join public.profiles p on p.id=ca.profile_id join auth.users u on u.id=p.auth_user_id where ca.id=v_account;
  select jsonb_build_object(
    'profile',jsonb_build_object('display_name',p.display_name,'email',v_email,'email_verified',v_verified,
      'mobile_number',ca.mobile_number,'mobile_verified',ca.mobile_verified_at is not null,
      'preferred_locale',ca.preferred_locale,'created_at',ca.created_at,'updated_at',ca.updated_at),
    'requests',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'reference_number',l.reference_number,'status',l.status,
      'submitted_at',l.submitted_at,'service_name_ar',s.name_ar,'service_name_en',s.name_en) order by l.submitted_at desc)
      from public.customer_account_leads cl join public.leads l on l.id=cl.lead_id join public.services s on s.id=l.service_id
      where cl.customer_account_id=v_account),'[]'::jsonb),
    'quotations',coalesce((select jsonb_agg(jsonb_build_object('id',q.id,'reference_number',l.reference_number,
      'quotation_number',q.quotation_number,'revision_number',q.revision_number,'status',q.status,'expires_at',q.expires_at,
      'total_amount',q.quoted_amount,'currency',q.currency) order by q.created_at desc)
      from public.customer_account_leads cl join public.leads l on l.id=cl.lead_id join public.quotations q on q.lead_id=l.id
      where cl.customer_account_id=v_account and q.status<>'draft'),'[]'::jsonb),
    'orders',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'reference_number',l.reference_number,'order_number',o.order_number,
      'execution_status',o.execution_status,'total_amount',o.total_amount,'currency',o.currency,'job_id',j.id,'job_number',j.job_number,'job_status',j.status,
      'review_available',j.status='completed','review_submitted',r.id is not null) order by o.created_at desc)
      from public.customer_account_leads cl join public.leads l on l.id=cl.lead_id join public.quotations q on q.lead_id=l.id
      join public.orders o on o.quotation_id=q.id left join public.operational_jobs j on j.order_id=o.id left join public.job_reviews r on r.job_id=j.id
      where cl.customer_account_id=v_account),'[]'::jsonb)
  ) into v_result from public.customer_accounts ca join public.profiles p on p.id=ca.profile_id where ca.id=v_account;
  return v_result;
end $$;

create or replace function public.account_get_job_tracking(p_job uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid;
begin
  v_account:=private.current_customer_account_id();
  if v_account is null or not exists(
    select 1 from public.customer_account_leads cl join public.quotations q on q.lead_id=cl.lead_id
    join public.orders o on o.quotation_id=q.id join public.operational_jobs j on j.order_id=o.id
    where cl.customer_account_id=v_account and j.id=p_job
  ) then return jsonb_build_object('state','invalid'); end if;
  return private.customer_job_payload(p_job);
end $$;

create or replace function public.account_issue_job_tracking_access(p_job uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_account uuid; v_profile uuid; v_access record;
begin
  v_account:=private.current_customer_account_id();
  select ca.profile_id into v_profile from public.customer_accounts ca where ca.id=v_account;
  if v_account is null or not exists(
    select 1 from public.customer_account_leads cl join public.quotations q on q.lead_id=cl.lead_id
    join public.orders o on o.quotation_id=q.id join public.operational_jobs j on j.order_id=o.id
    where cl.customer_account_id=v_account and j.id=p_job and j.status<>'cancelled'
  ) then return jsonb_build_object('state','invalid'); end if;
  select * into v_access from private.issue_job_tracking_access(p_job,v_profile);
  return jsonb_build_object('state','issued','tracking_token',v_access.plaintext_token);
end $$;

create or replace function public.get_public_business_settings()
returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_object_agg(replace(setting_key,'.','_'),value_text),'{}'::jsonb)
  from public.business_settings where is_public
$$;

create or replace function public.portal_get_context()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_role text; v_permissions jsonb; v_unread bigint;
begin
  v_profile:=private.require_portal_permission('portal.dashboard.read');
  select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id
    where pr.profile_id=v_profile and pr.status='active';
  select coalesce(jsonb_agg(pm.permission_key order by pm.permission_key),'[]'::jsonb) into v_permissions
    from public.profile_roles pr join public.role_permissions rp on rp.role_id=pr.role_id and rp.status='active'
    join public.permissions pm on pm.id=rp.permission_id and pm.status='active'
    where pr.profile_id=v_profile and pr.status='active';
  select count(*) into v_unread from public.lead_activity_logs a
    where a.occurred_at>now()-interval '30 days'
      and not exists(select 1 from public.staff_notification_reads nr where nr.profile_id=v_profile and nr.activity_log_id=a.id)
      and (
        (a.functional_area='sales' and private.has_permission_authoritative('sales.workspace.read'))
        or (a.functional_area='operations' and private.has_permission_authoritative('operations.workspace.read'))
        or (a.functional_area='quality' and private.has_permission_authoritative('quality.workspace.read'))
        or (a.functional_area in ('settings','administration') and private.has_permission_authoritative('administration.audit.read'))
      );
  return jsonb_build_object('profile_id',v_profile,'role_key',v_role,'permissions',v_permissions,'unread_count',v_unread,
    'has_customer_account',exists(select 1 from public.customer_accounts where profile_id=v_profile),
    'display_name',(select display_name from public.profiles where id=v_profile));
end $$;

create or replace function public.portal_get_dashboard()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_role text; v_metrics jsonb; v_actions jsonb;
begin
  v_profile:=private.require_portal_permission('portal.dashboard.read');
  select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=v_profile and pr.status='active';
  if v_role in ('sales','super_admin') then
    v_metrics:=jsonb_build_object('new_leads',(select count(*) from public.leads where status='new'),
      'draft_quotations',(select count(*) from public.quotations where status='draft'),
      'sent_quotations',(select count(*) from public.quotations where status='sent'),
      'accepted_orders',(select count(*) from public.orders where execution_status<>'cancelled'),
      'accepted_order_value',(select coalesce(sum(total_amount),0) from public.orders where execution_status<>'cancelled'),
      'average_order_value',(select coalesce(avg(total_amount),0) from public.orders where execution_status<>'cancelled'));
  elsif v_role='operations' then
    v_metrics:=jsonb_build_object('unscheduled',(select count(*) from public.operational_jobs where status='unscheduled'),
      'today',(select count(*) from public.trips where pickup_window_start::date=(now() at time zone 'Asia/Riyadh')::date),
      'in_progress',(select count(*) from public.operational_jobs where status='in_progress'),
      'delayed',(select count(*) from public.trips where condition='delayed' and status not in ('delivered','cancelled')),
      'issues',(select count(*) from public.trips where condition in ('operational_issue','paused') and status not in ('delivered','cancelled')),
      'cancellations',(select count(*) from public.job_cancellation_requests where status='pending'),
      'awaiting_confirmation',(select count(*) from public.operational_jobs where status='awaiting_customer_confirmation'));
  elsif v_role='customer_service' then
    v_metrics:=jsonb_build_object('open_quality_alerts',(select count(*) from public.quality_alerts where status<>'resolved'),
      'low_ratings',(select count(*) from public.job_reviews where overall_rating<=2),
      'recent_reviews',(select count(*) from public.job_reviews where created_at>now()-interval '7 days'),
      'cancellations',(select count(*) from public.job_cancellation_requests where status='pending'));
  elsif v_role='finance' then
    v_metrics:=jsonb_build_object('accepted_orders',(select count(*) from public.orders where execution_status<>'cancelled'),
      'accepted_order_value',(select coalesce(sum(total_amount),0) from public.orders where execution_status<>'cancelled'),
      'average_order_value',(select coalesce(avg(total_amount),0) from public.orders where execution_status<>'cancelled'));
  end if;
  if v_role='super_admin' then
    v_metrics:=v_metrics||jsonb_build_object('active_trips',(select count(*) from public.trips where status not in ('delivered','cancelled')),
      'delays',(select count(*) from public.trips where condition='delayed' and status not in ('delivered','cancelled')),
      'issues',(select count(*) from public.trips where condition in ('operational_issue','paused') and status not in ('delivered','cancelled')),
      'cancellations',(select count(*) from public.job_cancellation_requests where status='pending'),
      'quality_alerts',(select count(*) from public.quality_alerts where status<>'resolved'),
      'completed_jobs',(select count(*) from public.operational_jobs where status='completed'));
  end if;
  v_actions:=case
    when v_role in ('sales','super_admin') then jsonb_build_array(
      jsonb_build_object('key','new_leads','count',(select count(*) from public.leads where status='new'),'path','/sales/leads?status=new'),
      jsonb_build_object('key','sent_quotations','count',(select count(*) from public.quotations where status='sent'),'path','/sales/leads?quotation=sent'))
    when v_role='operations' then jsonb_build_array(
      jsonb_build_object('key','unscheduled','count',(select count(*) from public.operational_jobs where status='unscheduled'),'path','/operations/jobs?status=unscheduled'),
      jsonb_build_object('key','delayed','count',(select count(*) from public.trips where condition='delayed'),'path','/operations/jobs?condition=delayed'))
    when v_role='customer_service' then jsonb_build_array(
      jsonb_build_object('key','quality_alerts','count',(select count(*) from public.quality_alerts where status<>'resolved'),'path','/quality/reviews?alert=open'),
      jsonb_build_object('key','low_ratings','count',(select count(*) from public.job_reviews where overall_rating<=2),'path','/quality/reviews?rating=2'))
    else '[]'::jsonb end;
  return jsonb_build_object('role_key',v_role,'metrics',coalesce(v_metrics,'{}'::jsonb),'actions',v_actions);
end $$;

create or replace function public.portal_global_search(p_query text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_reference text:=upper(btrim(p_query)); v_result jsonb;
begin
  v_profile:=private.require_portal_permission('portal.search.read');
  if v_reference!~'^NQ-[0-9]{6}-[0-9]{6}$' then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(x.item),'[]'::jsonb) into v_result from (
    select jsonb_build_object('kind','lead','reference_number',l.reference_number,'label',l.customer_name,'path','/sales/leads/'||l.id) item
      from public.leads l where l.reference_number=v_reference and private.has_permission_authoritative('sales.workspace.read')
    union all
    select jsonb_build_object('kind','job','reference_number',l.reference_number,'label',j.job_number,'path','/operations/jobs/'||j.id)
      from public.leads l join public.quotations q on q.lead_id=l.id join public.orders o on o.quotation_id=q.id join public.operational_jobs j on j.order_id=o.id
      where l.reference_number=v_reference and private.has_permission_authoritative('operations.workspace.read')
    union all
    select jsonb_build_object('kind','review','reference_number',l.reference_number,'label',j.job_number,'path','/quality/reviews/'||r.id)
      from public.leads l join public.quotations q on q.lead_id=l.id join public.orders o on o.quotation_id=q.id join public.operational_jobs j on j.order_id=o.id join public.job_reviews r on r.job_id=j.id
      where l.reference_number=v_reference and private.has_permission_authoritative('quality.workspace.read')
    union all
    select jsonb_build_object('kind','order','reference_number',l.reference_number,'label',o.order_number,'path','/dashboard?reference='||l.reference_number)
      from public.leads l join public.quotations q on q.lead_id=l.id join public.orders o on o.quotation_id=q.id
      where l.reference_number=v_reference and private.has_permission_authoritative('finance.dashboard.read')
  ) x;
  return v_result;
end $$;

create or replace function private.portal_activity_visible(p_area text)
returns boolean language sql stable security definer set search_path='' as $$
  select case p_area
    when 'sales' then private.has_permission_authoritative('sales.workspace.read')
    when 'operations' then private.has_permission_authoritative('operations.workspace.read')
    when 'quality' then private.has_permission_authoritative('quality.workspace.read')
    when 'settings' then private.has_permission_authoritative('settings.business.read')
    when 'administration' then private.has_permission_authoritative('administration.audit.read')
    else false end
$$;

create or replace function public.portal_list_notifications(p_limit integer default 20)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_profile uuid;
begin
  v_profile:=private.require_portal_permission('portal.notifications.read');
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at desc) from (
    select a.id,a.event_key,a.functional_area,a.occurred_at,l.reference_number,
      nr.read_at is not null is_read,
      case
        when a.functional_area='sales' and a.lead_id is not null then '/sales/leads/'||a.lead_id
        when a.functional_area='operations' and a.job_id is not null then '/operations/jobs/'||a.job_id
        when a.functional_area='quality' then '/quality/reviews'
        when a.functional_area='settings' then '/settings/business'
        when a.functional_area='administration' then '/admin/activity'
        else '/dashboard' end path
    from public.lead_activity_logs a left join public.leads l on l.id=a.lead_id
    left join public.staff_notification_reads nr on nr.activity_log_id=a.id and nr.profile_id=v_profile
    where a.occurred_at>now()-interval '30 days' and private.portal_activity_visible(a.functional_area)
    order by a.occurred_at desc limit least(greatest(coalesce(p_limit,20),1),50)
  ) x),'[]'::jsonb);
end $$;

create or replace function public.portal_mark_notifications_read(p_activity uuid default null)
returns integer language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_count integer;
begin
  v_profile:=private.require_portal_permission('portal.notifications.read');
  insert into public.staff_notification_reads(profile_id,activity_log_id)
    select v_profile,a.id from public.lead_activity_logs a
    where (p_activity is null or a.id=p_activity) and a.occurred_at>now()-interval '30 days'
      and private.portal_activity_visible(a.functional_area)
    on conflict do nothing;
  get diagnostics v_count=row_count;
  return v_count;
end $$;

create or replace function public.admin_list_business_settings()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  perform private.require_portal_permission('settings.business.read');
  return jsonb_build_object(
    'settings',(select coalesce(jsonb_agg(to_jsonb(s) order by category,setting_key),'[]'::jsonb) from public.business_settings s),
    'service_areas',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'city_code',city_code,'name_ar',name_ar,'name_en',name_en,'status',status,'display_order',display_order) order by display_order,name_en),'[]'::jsonb) from public.cities where deleted_at is null)
  );
end $$;

create or replace function public.admin_update_business_setting(p_key text,p_value text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_old text; v_new text:=nullif(btrim(p_value),''); v_category text;
begin
  v_actor:=private.require_portal_permission('settings.business.manage');
  select value_text,category into v_old,v_category from public.business_settings where setting_key=p_key for update;
  if not found then raise exception using errcode='22023',message='Unsupported business setting'; end if;
  if p_key='contact.whatsapp' and (v_new is null or v_new!~'^9665[0-9]{8}$') then raise exception using errcode='22023',message='Invalid WhatsApp number'; end if;
  if p_key in ('customer.google_review_url','social.instagram','social.x','social.tiktok') and v_new is not null and v_new!~'^https://[^[:space:]]+$' then raise exception using errcode='22023',message='HTTPS URL required'; end if;
  if p_key in ('customer.review_edit_window_days','customer.driver_contact_visibility_hours','quotation.default_validity_days') and v_new is not null and (v_new!~'^[0-9]{1,3}$' or v_new::integer not between 1 and 365) then raise exception using errcode='22023',message='Invalid numeric setting'; end if;
  update public.business_settings set value_text=v_new,updated_at=now(),updated_by_profile_id=v_actor,version=version+1 where setting_key=p_key;
  perform private.write_platform_activity('settings','business_setting_changed','business_setting',extensions.uuid_generate_v5(extensions.uuid_ns_url(),p_key),v_actor,
    jsonb_build_object('setting_key',p_key,'old_configured',v_old is not null,'new_configured',v_new is not null));
  return jsonb_build_object('state','updated','setting_key',p_key);
end $$;

create or replace function public.admin_update_service_area(p_city uuid,p_status text,p_display_order integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
  v_actor:=private.require_portal_permission('settings.business.manage');
  if p_status not in ('active','inactive') or p_display_order not between 0 and 10000 then raise exception using errcode='22023',message='Invalid service area'; end if;
  update public.cities set status=p_status,display_order=p_display_order,updated_by_profile_id=v_actor where id=p_city and deleted_at is null;
  if not found then raise exception using errcode='P0002',message='Service area not found'; end if;
  perform private.write_platform_activity('settings','service_area_changed','city',p_city,v_actor,jsonb_build_object('status',p_status,'display_order',p_display_order));
  return jsonb_build_object('state','updated');
end $$;

create or replace function public.admin_set_staff_role(p_profile uuid,p_role text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_selected uuid; v_current text; v_assignment uuid;
begin
  v_actor:=private.require_portal_permission('administration.users.manage');
  if char_length(btrim(p_reason)) not between 8 and 500 then raise exception using errcode='22023',message='Reason required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('last-super-admin',0));
  select r.role_key into v_current from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p_profile and pr.status='active' for update of pr;
  select id into v_selected from public.roles where role_key=p_role and status='active';
  if v_selected is null then raise exception using errcode='22023',message='Invalid role'; end if;
  if v_current='super_admin' and p_role<>'super_admin' and not exists(
    select 1 from public.profiles p join public.profile_roles pr on pr.profile_id=p.id and pr.status='active'
    join public.roles r on r.id=pr.role_id and r.role_key='super_admin'
    where p.id<>p_profile and p.status='active' and p.staff_access_status='active'
  ) then raise exception using errcode='23514',message='The last active Super Admin cannot change role'; end if;
  if v_current=p_role then return jsonb_build_object('state','unchanged'); end if;
  update public.profiles set profile_kind='staff',status='suspended',staff_access_status='inactive',status_reason='Role reassignment in progress' where id=p_profile and status<>'closed';
  if not found then raise exception using errcode='P0002',message='Profile not found'; end if;
  update public.profile_roles set status='revoked',revoked_at=now(),revoked_by_profile_id=v_actor,revocation_reason=btrim(p_reason) where profile_id=p_profile and status='active';
  insert into public.profile_roles(profile_id,role_id,status,grant_reason,granted_by_profile_id)
    values(p_profile,v_selected,'active',btrim(p_reason),v_actor) returning id into v_assignment;
  update public.profiles set profile_kind='staff',status='active',staff_access_status='active',status_reason=btrim(p_reason) where id=p_profile;
  perform private.write_platform_activity('administration','staff_role_changed','profile',p_profile,v_actor,jsonb_build_object('from_role',v_current,'to_role',p_role));
  return jsonb_build_object('state','updated','assignment_id',v_assignment);
end $$;

create or replace function public.admin_set_staff_access(p_profile uuid,p_active boolean,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_role text;
begin
  v_actor:=private.require_portal_permission('administration.users.manage');
  if char_length(btrim(p_reason)) not between 8 and 500 then raise exception using errcode='22023',message='Reason required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('last-super-admin',0));
  select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id where pr.profile_id=p_profile and pr.status='active';
  if v_role is null then raise exception using errcode='22023',message='Staff role required'; end if;
  if not p_active and v_role='super_admin' and not exists(
    select 1 from public.profiles p join public.profile_roles pr on pr.profile_id=p.id and pr.status='active'
    join public.roles r on r.id=pr.role_id and r.role_key='super_admin'
    where p.id<>p_profile and p.status='active' and p.staff_access_status='active'
  ) then raise exception using errcode='23514',message='The last active Super Admin cannot be deactivated'; end if;
  update public.profiles set staff_access_status=case when p_active then 'active' else 'inactive' end,status_reason=btrim(p_reason) where id=p_profile and status='active';
  if not found then raise exception using errcode='P0002',message='Profile not found'; end if;
  perform private.write_platform_activity('administration',case when p_active then 'staff_reactivated' else 'staff_deactivated' end,'profile',p_profile,v_actor,jsonb_build_object('role',v_role));
  return jsonb_build_object('state',case when p_active then 'active' else 'inactive' end);
end $$;

create or replace function public.admin_register_staff_invitation(p_auth_user uuid,p_email text,p_name text,p_role text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_profile uuid; v_role uuid; v_invite uuid;
begin
  v_actor:=private.require_portal_permission('administration.users.manage');
  if lower(btrim(p_email))<>(select lower(email) from auth.users where id=p_auth_user) or char_length(btrim(p_name)) not between 2 and 120 then raise exception using errcode='22023',message='Invalid invitation identity'; end if;
  select id into v_profile from public.profiles where auth_user_id=p_auth_user for update;
  select id into v_role from public.roles where role_key=p_role and status='active';
  if v_profile is null or v_role is null then raise exception using errcode='22023',message='Invalid invitation'; end if;
  perform public.admin_set_staff_role(v_profile,p_role,'Staff invitation role assignment');
  insert into public.staff_invitations(auth_user_id,email,display_name,role_id,invited_by_profile_id)
    values(p_auth_user,lower(btrim(p_email)),btrim(p_name),v_role,v_actor)
    on conflict(lower(email)) where status='pending' do update set last_sent_at=now(),resend_count=public.staff_invitations.resend_count+1
    returning id into v_invite;
  perform private.write_platform_activity('administration','staff_invited','staff_invitation',v_invite,v_actor,jsonb_build_object('role',p_role));
  return v_invite;
end $$;

create or replace function public.admin_mark_invitation_resent(p_invitation uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
  v_actor:=private.require_portal_permission('administration.users.manage');
  update public.staff_invitations set last_sent_at=now(),resend_count=resend_count+1 where id=p_invitation and status='pending';
  if found then perform private.write_platform_activity('administration','staff_invitation_resent','staff_invitation',p_invitation,v_actor,'{}'::jsonb); end if;
  return found;
end $$;

create or replace function public.admin_cancel_staff_invitation(p_invitation uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_profile uuid;
begin
  v_actor:=private.require_portal_permission('administration.users.manage');
  if char_length(btrim(p_reason)) not between 8 and 500 then raise exception using errcode='22023',message='Reason required'; end if;
  select p.id into v_profile from public.staff_invitations i join public.profiles p on p.auth_user_id=i.auth_user_id where i.id=p_invitation and i.status='pending' for update of i;
  if v_profile is null then raise exception using errcode='P0002',message='Pending invitation not found'; end if;
  perform public.admin_set_staff_access(v_profile,false,p_reason);
  update public.staff_invitations set status='cancelled',cancelled_at=now(),cancelled_by_profile_id=v_actor,cancellation_reason=btrim(p_reason) where id=p_invitation;
  perform private.write_platform_activity('administration','staff_invitation_cancelled','staff_invitation',p_invitation,v_actor,'{}'::jsonb);
  return jsonb_build_object('state','cancelled');
end $$;

create or replace function public.admin_list_users(p_search text default null,p_role text default null,p_status text default null,p_page integer default 1,p_size integer default 20)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_page int:=greatest(coalesce(p_page,1),1); v_size int:=least(greatest(coalesce(p_size,20),1),100);
begin
  perform private.require_portal_permission('administration.users.read');
  if p_status is not null and p_status not in ('active','inactive','pending') then raise exception using errcode='22023',message='Invalid status'; end if;
  return (with filtered as (
    select p.id,p.display_name,u.email,p.staff_access_status,p.status,p.last_login_at,p.created_at,r.role_key,
      i.id invitation_id,i.status invitation_status,i.last_sent_at
    from public.profiles p join auth.users u on u.id=p.auth_user_id
    left join public.profile_roles pr on pr.profile_id=p.id and pr.status='active'
    left join public.roles r on r.id=pr.role_id
    left join lateral(select * from public.staff_invitations si where si.auth_user_id=u.id order by si.invited_at desc limit 1)i on true
    where (p_search is null or p.display_name ilike '%'||p_search||'%' or u.email ilike '%'||p_search||'%')
      and (p_role is null or r.role_key=p_role)
      and (p_status is null or case p_status when 'active' then p.staff_access_status='active' when 'inactive' then p.staff_access_status='inactive' else i.status='pending' end)
  ),paged as (select * from filtered order by created_at desc limit v_size offset(v_page-1)*v_size)
  select jsonb_build_object('page',v_page,'page_size',v_size,'total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb)));
end $$;

create or replace function public.admin_list_roles_permissions()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  perform private.require_portal_permission('identity.role.read');
  return coalesce((select jsonb_agg(jsonb_build_object('role_key',r.role_key,'name_ar',r.name_ar,'name_en',r.name_en,
    'permissions',(select coalesce(jsonb_agg(pm.permission_key order by pm.permission_key),'[]'::jsonb) from public.role_permissions rp join public.permissions pm on pm.id=rp.permission_id where rp.role_id=r.id and rp.status='active' and pm.status='active')) order by r.role_key)
    from public.roles r where r.status='active'),'[]'::jsonb);
end $$;

create or replace function public.admin_list_activity(p_search text default null,p_area text default null,p_event text default null,p_from timestamptz default null,p_to timestamptz default null,p_page integer default 1,p_size integer default 30)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_page int:=greatest(coalesce(p_page,1),1); v_size int:=least(greatest(coalesce(p_size,30),1),100);
begin
  perform private.require_portal_permission('administration.audit.read');
  return (with filtered as (
    select a.id,a.event_key,a.functional_area,a.occurred_at,a.subject_type,a.subject_id,l.reference_number,p.display_name actor_name,
      a.details-'reason'-'internal_reason'-'note'-'comment' details
    from public.lead_activity_logs a left join public.leads l on l.id=a.lead_id left join public.profiles p on p.id=a.actor_profile_id
    where (p_search is null or l.reference_number ilike '%'||p_search||'%' or p.display_name ilike '%'||p_search||'%')
      and (p_area is null or a.functional_area=p_area) and (p_event is null or a.event_key=p_event)
      and (p_from is null or a.occurred_at>=p_from) and (p_to is null or a.occurred_at<=p_to)
  ),paged as(select * from filtered order by occurred_at desc limit v_size offset(v_page-1)*v_size)
  select jsonb_build_object('page',v_page,'page_size',v_size,'total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb)));
end $$;

create or replace function public.provision_staff_identity(target_auth_user_id uuid,target_role_key text,target_display_name text,change_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_role uuid; v_assignment uuid;
begin
  if auth.role()<>'service_role' then raise exception using errcode='42501',message='Not authorized'; end if;
  if char_length(btrim(target_display_name)) not between 2 and 120 or char_length(btrim(change_reason)) not between 8 and 500 then raise exception using errcode='22023',message='Valid identity data required'; end if;
  select id into v_profile from public.profiles where auth_user_id=target_auth_user_id and status<>'closed' for update;
  select id into v_role from public.roles where role_key=target_role_key and status='active';
  if v_profile is null or v_role is null then raise exception using errcode='22023',message='Identity or role not eligible'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('last-super-admin',0));
  update public.profiles set profile_kind='staff',status='suspended',staff_access_status='inactive',display_name=btrim(target_display_name),status_reason='Staff provisioning in progress' where id=v_profile;
  update public.profile_roles set status='revoked',revoked_at=now(),revocation_reason=change_reason where profile_id=v_profile and status='active';
  insert into public.profile_roles(profile_id,role_id,status,grant_reason) values(v_profile,v_role,'active',change_reason) returning id into v_assignment;
  update public.profiles set status='active',staff_access_status='active',status_reason=change_reason where id=v_profile;
  insert into public.customer_accounts(profile_id,preferred_locale) select id,preferred_locale from public.profiles where id=v_profile on conflict(profile_id) do nothing;
  return v_assignment;
end $$;

alter table public.customer_accounts enable row level security;
alter table public.customer_account_leads enable row level security;
alter table public.staff_notification_reads enable row level security;
alter table public.business_settings enable row level security;
alter table public.staff_invitations enable row level security;

create policy rls_customer_accounts__select__self on public.customer_accounts for select to authenticated
using(profile_id=(select private.current_profile_id_authoritative()));
create policy rls_customer_account_leads__select__self on public.customer_account_leads for select to authenticated
using(customer_account_id=(select private.current_customer_account_id()));
create policy rls_notification_reads__select__self on public.staff_notification_reads for select to authenticated
using(profile_id=(select private.current_profile_id_authoritative()));
create policy rls_business_settings__select__manager on public.business_settings for select to authenticated
using((select private.has_permission_authoritative('settings.business.read')));
create policy rls_staff_invitations__select__administrator on public.staff_invitations for select to authenticated
using((select private.has_permission_authoritative('administration.users.read')));

revoke all on table public.customer_accounts,public.customer_account_leads,public.staff_notification_reads,public.business_settings,public.staff_invitations from public,anon,authenticated;
grant select on table public.customer_accounts,public.customer_account_leads,public.staff_notification_reads,public.business_settings,public.staff_invitations to authenticated;
grant all on table public.customer_accounts,public.customer_account_leads,public.staff_notification_reads,public.business_settings,public.staff_invitations to service_role;

revoke all on function private.current_customer_account_id(),private.require_portal_permission(text),private.write_platform_activity(text,text,text,uuid,uuid,jsonb),private.protect_staff_access_invariants(),private.link_customer_lead(uuid,uuid,text,uuid),private.portal_activity_visible(text) from public,anon,authenticated;
grant execute on function private.current_customer_account_id(),private.require_portal_permission(text),private.portal_activity_visible(text) to authenticated,service_role;

revoke all on function public.resolve_identity_context(),public.account_update_profile(text,text,text),public.account_claim_request(text,text),public.account_link_submission(uuid),public.account_get_dashboard(),public.account_get_job_tracking(uuid),public.account_issue_job_tracking_access(uuid),public.portal_get_context(),public.portal_get_dashboard(),public.portal_global_search(text),public.portal_list_notifications(integer),public.portal_mark_notifications_read(uuid),public.admin_list_business_settings(),public.admin_update_business_setting(text,text),public.admin_update_service_area(uuid,text,integer),public.admin_set_staff_role(uuid,text,text),public.admin_set_staff_access(uuid,boolean,text),public.admin_register_staff_invitation(uuid,text,text,text),public.admin_mark_invitation_resent(uuid),public.admin_cancel_staff_invitation(uuid,text),public.admin_list_users(text,text,text,integer,integer),public.admin_list_roles_permissions(),public.admin_list_activity(text,text,text,timestamptz,timestamptz,integer,integer) from public,anon,authenticated;
grant execute on function public.resolve_identity_context(),public.account_update_profile(text,text,text),public.account_claim_request(text,text),public.account_link_submission(uuid),public.account_get_dashboard(),public.account_get_job_tracking(uuid),public.account_issue_job_tracking_access(uuid),public.portal_get_context(),public.portal_get_dashboard(),public.portal_global_search(text),public.portal_list_notifications(integer),public.portal_mark_notifications_read(uuid),public.admin_list_business_settings(),public.admin_update_business_setting(text,text),public.admin_update_service_area(uuid,text,integer),public.admin_set_staff_role(uuid,text,text),public.admin_set_staff_access(uuid,boolean,text),public.admin_register_staff_invitation(uuid,text,text,text),public.admin_mark_invitation_resent(uuid),public.admin_cancel_staff_invitation(uuid,text),public.admin_list_users(text,text,text,integer,integer),public.admin_list_roles_permissions(),public.admin_list_activity(text,text,text,timestamptz,timestamptz,integer,integer) to authenticated;

revoke all on function public.get_public_business_settings() from public,anon,authenticated;
grant execute on function public.get_public_business_settings() to anon,authenticated,service_role;

revoke all on function public.provision_staff_identity(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.provision_staff_identity(uuid,text,text,text) to service_role;

comment on table public.customer_accounts is 'Optional customer context attached to one Supabase Auth profile; independent from staff RBAC.';
comment on table public.customer_account_leads is 'Auditable, capability-proven ownership links from customer accounts to Guest-originated Leads.';
comment on table public.staff_notification_reads is 'Per-profile read materialization for permission-filtered event-derived Portal notifications.';
comment on table public.business_settings is 'Allowlisted non-secret business configuration with environment fallback at runtime.';
comment on function public.account_claim_request(text,text) is 'Authenticated capability-scoped Guest-to-account claim; NQ, email, mobile, or UUID alone are never sufficient.';
comment on function public.account_issue_job_tracking_access(uuid) is 'Issues a rotated one-time-delivery tracking capability only after authenticated Customer Account ownership validation.';
comment on function public.portal_global_search(text) is 'Permission-filtered exact NQ search returning only authorized destinations.';

commit;
