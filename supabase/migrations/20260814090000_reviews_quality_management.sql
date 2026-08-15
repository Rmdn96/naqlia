begin;

insert into public.permissions (permission_key, description_ar, description_en, risk_level, status)
values
  ('quality.workspace.read', 'عرض مساحة المراجعات والجودة', 'Read the Reviews and Quality workspace', 'low', 'active'),
  ('quality.alert.manage', 'إدارة تنبيهات الجودة والمتابعة', 'Manage Quality Alerts and follow-up', 'high', 'active'),
  ('quality.publication.manage', 'إدارة نشر وإبراز المراجعات', 'Manage Review publication and featuring', 'high', 'active')
on conflict (permission_key) do update set
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  risk_level = excluded.risk_level,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id, status, grant_reason)
select r.id, p.id, 'active', 'Reviews and Quality Management v1 approved role boundary'
from public.roles r
cross join public.permissions p
where (r.role_key = 'super_admin' and p.permission_key in ('quality.workspace.read','quality.alert.manage','quality.publication.manage'))
   or (r.role_key = 'customer_service' and p.permission_key in ('quality.workspace.read','quality.alert.manage'))
   or (r.role_key = 'operations' and p.permission_key = 'quality.workspace.read')
on conflict (role_id, permission_id) where status = 'active' do nothing;

create table public.job_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.operational_jobs(id) on delete restrict,
  overall_rating smallint not null,
  punctuality_rating smallint,
  handling_rating smallint,
  comment text,
  publication_consent boolean not null default false,
  publication_status text not null default 'private',
  is_featured boolean not null default false,
  is_verified boolean not null default true,
  published_at timestamptz,
  published_by_profile_id uuid references public.profiles(id) on delete restrict,
  unpublished_at timestamptz,
  unpublished_by_profile_id uuid references public.profiles(id) on delete restrict,
  featured_at timestamptz,
  featured_by_profile_id uuid references public.profiles(id) on delete restrict,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_job_reviews__job_id unique (job_id),
  constraint ck_job_reviews__overall_rating check (overall_rating between 1 and 5),
  constraint ck_job_reviews__punctuality_rating check (punctuality_rating is null or punctuality_rating between 1 and 5),
  constraint ck_job_reviews__handling_rating check (handling_rating is null or handling_rating between 1 and 5),
  constraint ck_job_reviews__comment check (comment is null or char_length(comment) between 1 and 2000),
  constraint ck_job_reviews__publication_status check (publication_status in ('private','pending_publication','published','unpublished')),
  constraint ck_job_reviews__verified check (is_verified),
  constraint ck_job_reviews__publication_consent check (publication_status <> 'published' or publication_consent),
  constraint ck_job_reviews__featured check (not is_featured or (publication_status = 'published' and publication_consent)),
  constraint ck_job_reviews__version check (version > 0)
);

create table public.review_driver_ratings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.job_reviews(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  rating smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_review_driver_ratings__review_driver unique (review_id, driver_id),
  constraint ck_review_driver_ratings__rating check (rating between 1 and 5)
);

create table public.quality_alerts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.operational_jobs(id) on delete restrict,
  review_id uuid not null references public.job_reviews(id) on delete restrict,
  status text not null default 'open',
  assigned_to_profile_id uuid references public.profiles(id) on delete restrict,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by_profile_id uuid references public.profiles(id) on delete restrict,
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_quality_alerts__job_id unique (job_id),
  constraint uq_quality_alerts__review_id unique (review_id),
  constraint ck_quality_alerts__status check (status in ('open','in_progress','resolved')),
  constraint ck_quality_alerts__resolution check (
    (status <> 'resolved' and resolved_at is null and resolved_by_profile_id is null and resolution_summary is null)
    or (status = 'resolved' and resolved_at is not null and resolved_by_profile_id is not null and char_length(btrim(resolution_summary)) between 8 and 2000)
  )
);

create table public.quality_alert_notes (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.quality_alerts(id) on delete restrict,
  note text not null,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint ck_quality_alert_notes__note check (char_length(btrim(note)) between 2 and 2000)
);

create index idx_job_reviews__publication_updated on public.job_reviews(publication_status, updated_at desc);
create index idx_job_reviews__rating_updated on public.job_reviews(overall_rating, updated_at desc);
create index idx_review_driver_ratings__driver on public.review_driver_ratings(driver_id, created_at desc);
create index idx_quality_alerts__status_updated on public.quality_alerts(status, updated_at desc);
create index idx_quality_alert_notes__alert_created on public.quality_alert_notes(alert_id, created_at desc);

create trigger trg_job_reviews__before_update__timestamp
before update on public.job_reviews for each row execute function private.set_updated_at();
create trigger trg_review_driver_ratings__before_update__timestamp
before update on public.review_driver_ratings for each row execute function private.set_updated_at();
create trigger trg_quality_alerts__before_update__timestamp
before update on public.quality_alerts for each row execute function private.set_updated_at();

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
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

create or replace function private.require_quality_permission(p_permission text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_profile uuid;
begin
  if auth.role() <> 'authenticated' or not private.has_permission_authoritative(p_permission) then
    raise exception using errcode = '42501', message = 'Quality permission is required';
  end if;
  v_profile := private.current_profile_id_authoritative();
  if v_profile is null then
    raise exception using errcode = '42501', message = 'Active staff profile is required';
  end if;
  return v_profile;
end $$;

create or replace function private.review_customer_context(p_token text, p_lock boolean default false)
returns table(access_id uuid, job_id uuid) language plpgsql security definer set search_path='' as $$
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return; end if;
  if p_lock then
    return query
      select a.id, a.job_id from public.job_tracking_accesses a
      join public.operational_jobs j on j.id = a.job_id
      where a.token_hash = extensions.digest(p_token, 'sha256')
        and a.status = 'active' and a.expires_at > now() and j.status = 'completed'
      for update of a, j;
  else
    return query
      select a.id, a.job_id from public.job_tracking_accesses a
      join public.operational_jobs j on j.id = a.job_id
      where a.token_hash = extensions.digest(p_token, 'sha256')
        and a.status = 'active' and a.expires_at > now() and j.status = 'completed';
  end if;
end $$;

create or replace function private.review_customer_payload(p_job uuid)
returns jsonb language sql security definer set search_path='' stable as $$
  select jsonb_build_object(
    'state', 'eligible',
    'review', case when r.id is null then null else jsonb_build_object(
      'overall_rating', r.overall_rating,
      'punctuality_rating', r.punctuality_rating,
      'handling_rating', r.handling_rating,
      'comment', r.comment,
      'publication_consent', r.publication_consent,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'version', r.version
    ) end,
    'drivers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id,
        'display_name', d.display_name,
        'rating', rr.rating
      ) order by d.display_name)
      from (
        select distinct t.driver_id from public.trips t
        where t.job_id = j.id and t.status = 'delivered' and t.driver_id is not null
      ) p
      join public.drivers d on d.id = p.driver_id
      left join public.review_driver_ratings rr on rr.review_id = r.id and rr.driver_id = d.id
    ), '[]'::jsonb)
  )
  from public.operational_jobs j
  left join public.job_reviews r on r.job_id = j.id
  where j.id = p_job and j.status = 'completed'
$$;

create or replace function public.customer_get_job_review(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_context record;
begin
  select * into v_context from private.review_customer_context(p_token, false);
  if not found then return jsonb_build_object('state','invalid'); end if;
  return private.review_customer_payload(v_context.job_id);
end $$;

create or replace function public.customer_upsert_job_review(
  p_token text,
  p_overall_rating integer,
  p_punctuality_rating integer default null,
  p_handling_rating integer default null,
  p_comment text default null,
  p_publication_consent boolean default false,
  p_driver_ratings jsonb default '[]'::jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_context record;
  v_review public.job_reviews%rowtype;
  v_existing public.job_reviews%rowtype;
  v_comment text := nullif(btrim(p_comment), '');
  v_item jsonb;
  v_driver uuid;
  v_rating integer;
  v_new_status text;
  v_material_change boolean := false;
  v_consent_change boolean := false;
  v_created boolean := false;
  v_alert uuid;
begin
  if p_overall_rating is null or p_overall_rating not between 1 and 5
     or (p_punctuality_rating is not null and p_punctuality_rating not between 1 and 5)
     or (p_handling_rating is not null and p_handling_rating not between 1 and 5)
     or (v_comment is not null and char_length(v_comment) > 2000)
     or p_publication_consent is null
     or p_driver_ratings is null or jsonb_typeof(p_driver_ratings) <> 'array'
     or jsonb_array_length(p_driver_ratings) > 50 then
    return jsonb_build_object('state','invalid');
  end if;

  select * into v_context from private.review_customer_context(p_token, true);
  if not found then return jsonb_build_object('state','invalid'); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('job-review:' || v_context.job_id::text, 0));

  for v_item in select value from jsonb_array_elements(p_driver_ratings) loop
    if jsonb_typeof(v_item) <> 'object'
       or v_item - 'driver_id' - 'rating' <> '{}'::jsonb
       or jsonb_typeof(v_item->'driver_id') <> 'string'
       or jsonb_typeof(v_item->'rating') <> 'number' then
      return jsonb_build_object('state','invalid');
    end if;
    begin
      v_driver := (v_item->>'driver_id')::uuid;
      v_rating := (v_item->>'rating')::integer;
    exception when others then
      return jsonb_build_object('state','invalid');
    end;
    if v_rating not between 1 and 5 or not exists (
      select 1 from public.trips t
      where t.job_id = v_context.job_id and t.driver_id = v_driver and t.status = 'delivered'
    ) then return jsonb_build_object('state','invalid'); end if;
  end loop;
  if (select count(*) from jsonb_array_elements(p_driver_ratings)) <>
     (select count(distinct (value->>'driver_id')) from jsonb_array_elements(p_driver_ratings)) then
    return jsonb_build_object('state','invalid');
  end if;

  select * into v_existing from public.job_reviews where job_id = v_context.job_id for update;
  if not found then
    v_created := true;
    v_new_status := case when p_publication_consent then 'pending_publication' else 'private' end;
    insert into public.job_reviews(job_id,overall_rating,punctuality_rating,handling_rating,comment,publication_consent,publication_status)
    values(v_context.job_id,p_overall_rating,p_punctuality_rating,p_handling_rating,v_comment,p_publication_consent,v_new_status)
    returning * into v_review;
  else
    v_material_change := v_existing.overall_rating is distinct from p_overall_rating
      or v_existing.punctuality_rating is distinct from p_punctuality_rating
      or v_existing.handling_rating is distinct from p_handling_rating
      or v_existing.comment is distinct from v_comment
      or exists (
        select 1 from public.review_driver_ratings rr
        where rr.review_id=v_existing.id and not exists (
          select 1 from jsonb_array_elements(p_driver_ratings) item
          where (item->>'driver_id')::uuid=rr.driver_id and (item->>'rating')::integer=rr.rating
        )
      )
      or exists (
        select 1 from jsonb_array_elements(p_driver_ratings) item
        where not exists (
          select 1 from public.review_driver_ratings rr
          where rr.review_id=v_existing.id and rr.driver_id=(item->>'driver_id')::uuid and rr.rating=(item->>'rating')::integer
        )
      );
    v_consent_change := v_existing.publication_consent is distinct from p_publication_consent;
    v_new_status := case
      when not p_publication_consent and v_existing.publication_status in ('published','pending_publication') then 'unpublished'
      when p_publication_consent and not v_existing.publication_consent then 'pending_publication'
      when v_material_change and v_existing.publication_status = 'published' then 'pending_publication'
      else v_existing.publication_status
    end;
    update public.job_reviews set
      overall_rating=p_overall_rating,punctuality_rating=p_punctuality_rating,handling_rating=p_handling_rating,
      comment=v_comment,publication_consent=p_publication_consent,publication_status=v_new_status,
      is_featured=case when v_new_status='published' and p_publication_consent then is_featured else false end,
      version=version+1
    where id=v_existing.id returning * into v_review;
    delete from public.review_driver_ratings where review_id=v_review.id;
  end if;

  insert into public.review_driver_ratings(review_id,driver_id,rating)
  select v_review.id,(value->>'driver_id')::uuid,(value->>'rating')::integer
  from jsonb_array_elements(p_driver_ratings);

  if p_overall_rating <= 2 then
    insert into public.quality_alerts(job_id,review_id) values(v_context.job_id,v_review.id)
    on conflict(job_id) do nothing returning id into v_alert;
    if v_alert is not null then
      perform private.write_operation_activity(v_context.job_id,null,'quality_alert_created',null,jsonb_build_object('overall_rating',p_overall_rating));
    end if;
  end if;

  perform private.write_operation_activity(v_context.job_id,null,
    case when v_created then 'review_submitted' else 'review_updated' end,null,
    jsonb_build_object('overall_rating',p_overall_rating,'version',v_review.version));
  if v_consent_change then
    perform private.write_operation_activity(v_context.job_id,null,'publication_consent_changed',null,
      jsonb_build_object('publication_consent',p_publication_consent));
  end if;
  return private.review_customer_payload(v_context.job_id);
end $$;

create or replace function public.quality_list_reviews(
  p_page integer default 1,
  p_page_size integer default 20,
  p_rating integer default null,
  p_publication_status text default null,
  p_alert_status text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_result jsonb; v_page int:=greatest(coalesce(p_page,1),1); v_size int:=least(greatest(coalesce(p_page_size,20),1),100);
begin
  perform private.require_quality_permission('quality.workspace.read');
  if (p_rating is not null and p_rating not between 1 and 5)
     or (p_publication_status is not null and p_publication_status not in ('private','pending_publication','published','unpublished'))
     or (p_alert_status is not null and p_alert_status not in ('open','in_progress','resolved')) then
    raise exception using errcode='22023',message='Invalid quality filter';
  end if;
  with filtered as (
    select r.id,r.overall_rating,r.publication_consent,r.publication_status,r.is_featured,r.created_at,r.updated_at,
      l.reference_number,l.customer_name,j.job_number,o.order_number,
      qa.id quality_alert_id,qa.status quality_alert_status
    from public.job_reviews r
    join public.operational_jobs j on j.id=r.job_id
    join public.orders o on o.id=j.order_id
    join public.quotations q on q.id=o.quotation_id
    join public.leads l on l.id=q.lead_id
    left join public.quality_alerts qa on qa.review_id=r.id
    where (p_rating is null or r.overall_rating=p_rating)
      and (p_publication_status is null or r.publication_status=p_publication_status)
      and (p_alert_status is null or qa.status=p_alert_status)
  ), paged as (
    select * from filtered order by updated_at desc limit v_size offset (v_page-1)*v_size
  )
  select jsonb_build_object('page',v_page,'page_size',v_size,'total',(select count(*) from filtered),
    'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb)) into v_result;
  return v_result;
end $$;

create or replace function public.quality_get_review(p_review uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_can_alert boolean;
begin
  perform private.require_quality_permission('quality.workspace.read');
  v_can_alert := private.has_permission_authoritative('quality.alert.manage');
  return (
    select jsonb_build_object(
      'review',to_jsonb(r),
      'job',jsonb_build_object('job_number',j.job_number,'status',j.status),
      'lead',jsonb_build_object('reference_number',l.reference_number,'customer_name',l.customer_name),
      'driver_ratings',coalesce((select jsonb_agg(jsonb_build_object('driver_id',d.id,'display_name',d.display_name,'rating',rr.rating) order by d.display_name) from public.review_driver_ratings rr join public.drivers d on d.id=rr.driver_id where rr.review_id=r.id),'[]'::jsonb),
      'quality_alert',case when v_can_alert and qa.id is not null then to_jsonb(qa) else null end,
      'quality_notes',case when v_can_alert and qa.id is not null then coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'note',n.note,'created_at',n.created_at,'actor_name',p.display_name) order by n.created_at desc) from public.quality_alert_notes n left join public.profiles p on p.id=n.actor_profile_id where n.alert_id=qa.id),'[]'::jsonb) else '[]'::jsonb end
    )
    from public.job_reviews r
    join public.operational_jobs j on j.id=r.job_id
    join public.orders o on o.id=j.order_id
    join public.quotations q on q.id=o.quotation_id
    join public.leads l on l.id=q.lead_id
    left join public.quality_alerts qa on qa.review_id=r.id
    where r.id=p_review
  );
end $$;

create or replace function public.quality_set_review_publication(p_review uuid,p_action text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_review public.job_reviews%rowtype; v_event text;
begin
  v_actor:=private.require_quality_permission('quality.publication.manage');
  if p_action not in ('publish','unpublish','feature','unfeature') then raise exception using errcode='22023',message='Unsupported publication action'; end if;
  select * into v_review from public.job_reviews where id=p_review for update;
  if not found then raise exception using errcode='P0002',message='Review not found'; end if;
  if p_action in ('publish','feature') and not v_review.publication_consent then raise exception using errcode='23514',message='Publication consent is required'; end if;
  if p_action='publish' then
    update public.job_reviews set publication_status='published',published_at=now(),published_by_profile_id=v_actor,
      unpublished_at=null,unpublished_by_profile_id=null where id=p_review returning * into v_review;
    v_event:='review_publication_approved';
  elsif p_action='unpublish' then
    update public.job_reviews set publication_status='unpublished',is_featured=false,unpublished_at=now(),unpublished_by_profile_id=v_actor where id=p_review returning * into v_review;
    v_event:='review_unpublished';
  elsif p_action='feature' then
    if v_review.publication_status<>'published' then raise exception using errcode='23514',message='Only a published Review can be featured'; end if;
    update public.job_reviews set is_featured=true,featured_at=now(),featured_by_profile_id=v_actor where id=p_review returning * into v_review;
    v_event:='review_featured';
  else
    update public.job_reviews set is_featured=false where id=p_review returning * into v_review;
    v_event:='review_unfeatured';
  end if;
  perform private.write_operation_activity(v_review.job_id,null,v_event,v_actor,'{}'::jsonb);
  return to_jsonb(v_review);
end $$;

create or replace function public.quality_update_alert(p_alert uuid,p_status text,p_note text default null,p_resolution text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_alert public.quality_alerts%rowtype; v_note text:=nullif(btrim(p_note),''); v_resolution text:=nullif(btrim(p_resolution),''); v_event text;
begin
  v_actor:=private.require_quality_permission('quality.alert.manage');
  if p_status not in ('open','in_progress','resolved') or (v_note is not null and char_length(v_note)>2000)
     or (p_status='resolved' and (v_resolution is null or char_length(v_resolution)<8 or char_length(v_resolution)>2000)) then
    raise exception using errcode='22023',message='Invalid Quality Alert update';
  end if;
  select * into v_alert from public.quality_alerts where id=p_alert for update;
  if not found then raise exception using errcode='P0002',message='Quality Alert not found'; end if;
  update public.quality_alerts set status=p_status,
    assigned_to_profile_id=coalesce(assigned_to_profile_id,v_actor),
    resolved_at=case when p_status='resolved' then now() else null end,
    resolved_by_profile_id=case when p_status='resolved' then v_actor else null end,
    resolution_summary=case when p_status='resolved' then v_resolution else null end
  where id=p_alert returning * into v_alert;
  if v_note is not null then insert into public.quality_alert_notes(alert_id,note,actor_profile_id) values(p_alert,v_note,v_actor); end if;
  v_event:=case when p_status='resolved' then 'quality_alert_resolved' else 'quality_alert_status_changed' end;
  perform private.write_operation_activity(v_alert.job_id,null,v_event,v_actor,jsonb_build_object('status',p_status));
  return to_jsonb(v_alert);
end $$;

alter table public.job_reviews enable row level security;
alter table public.review_driver_ratings enable row level security;
alter table public.quality_alerts enable row level security;
alter table public.quality_alert_notes enable row level security;

create policy rls_job_reviews__select__quality_reader on public.job_reviews for select to authenticated using ((select public.has_permission('quality.workspace.read')));
create policy rls_review_driver_ratings__select__quality_reader on public.review_driver_ratings for select to authenticated using ((select public.has_permission('quality.workspace.read')));
create policy rls_quality_alerts__select__quality_manager on public.quality_alerts for select to authenticated using ((select public.has_permission('quality.alert.manage')));
create policy rls_quality_alert_notes__select__quality_manager on public.quality_alert_notes for select to authenticated using ((select public.has_permission('quality.alert.manage')));

revoke all on table public.job_reviews,public.review_driver_ratings,public.quality_alerts,public.quality_alert_notes from public,anon,authenticated;
grant select on table public.job_reviews,public.review_driver_ratings to authenticated;
grant select on table public.quality_alerts,public.quality_alert_notes to authenticated;
grant all on table public.job_reviews,public.review_driver_ratings,public.quality_alerts,public.quality_alert_notes to service_role;

revoke all on function public.customer_get_job_review(text),public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.customer_get_job_review(text),public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb) to anon,authenticated;
revoke all on function public.quality_list_reviews(integer,integer,integer,text,text),public.quality_get_review(uuid),public.quality_set_review_publication(uuid,text),public.quality_update_alert(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.quality_list_reviews(integer,integer,integer,text,text),public.quality_get_review(uuid),public.quality_set_review_publication(uuid,text),public.quality_update_alert(uuid,text,text,text) to authenticated;
revoke all on function private.require_quality_permission(text),private.review_customer_context(text,boolean),private.review_customer_payload(uuid) from public,anon,authenticated,service_role;

comment on table public.job_reviews is 'One internally verified customer Review per completed operational Job; private until governed publication.';
comment on table public.review_driver_ratings is 'Optional verified ratings for Drivers assigned to delivered Trips in the reviewed Job.';
comment on table public.quality_alerts is 'Idempotent internal follow-up for low-rating Reviews; never customer-visible.';
comment on function public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb) is 'Capability-scoped, concurrency-safe Review create/update; customer cannot control verification or publication.';

commit;
