begin;

create table public.city_seo_contents (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete restrict,
  locale text not null,
  slug text not null,
  seo_title text,
  meta_description text,
  page_heading text,
  introduction text,
  service_area_content text,
  neighborhood_coverage_text text,
  content_status text not null default 'draft',
  is_indexable boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  version integer not null default 1,
  constraint uq_city_seo_contents__city_locale unique(city_id,locale),
  constraint uq_city_seo_contents__locale_slug unique(locale,slug),
  constraint ck_city_seo_contents__locale check(locale in ('ar','en')),
  constraint ck_city_seo_contents__slug check(
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and slug not in ('account','admin','dashboard','finance','forgot-password','login','operations','privacy','quality','quote','request','reset-password','sales','services','settings','signup','staff','track','verify-email')
  ),
  constraint ck_city_seo_contents__status check(content_status in ('draft','ready','published')),
  constraint ck_city_seo_contents__title check(seo_title is null or char_length(btrim(seo_title)) between 20 and 70),
  constraint ck_city_seo_contents__meta check(meta_description is null or char_length(btrim(meta_description)) between 70 and 180),
  constraint ck_city_seo_contents__heading check(page_heading is null or char_length(btrim(page_heading)) between 8 and 140),
  constraint ck_city_seo_contents__introduction check(introduction is null or char_length(btrim(introduction)) between 120 and 2400),
  constraint ck_city_seo_contents__service_area check(service_area_content is null or char_length(btrim(service_area_content)) between 120 and 3200),
  constraint ck_city_seo_contents__coverage check(neighborhood_coverage_text is null or char_length(btrim(neighborhood_coverage_text)) between 40 and 2400),
  constraint ck_city_seo_contents__plain_text check(
    coalesce(seo_title,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and coalesce(meta_description,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and coalesce(page_heading,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and coalesce(introduction,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and coalesce(service_area_content,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and coalesce(neighborhood_coverage_text,'') !~* '<[[:space:]]*(script|iframe|object|embed|style)'
  ),
  constraint ck_city_seo_contents__publication_state check(
    (content_status='published' and published_at is not null)
    or (content_status<>'published' and published_at is null and is_indexable=false)
  ),
  constraint ck_city_seo_contents__indexability check(not is_indexable or content_status='published'),
  constraint ck_city_seo_contents__version check(version > 0)
);

create table public.city_seo_faqs (
  id uuid primary key default gen_random_uuid(),
  city_seo_content_id uuid not null references public.city_seo_contents(id) on delete cascade,
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_city_seo_faqs__content_order unique(city_seo_content_id,display_order),
  constraint ck_city_seo_faqs__question check(char_length(btrim(question)) between 12 and 220),
  constraint ck_city_seo_faqs__answer check(char_length(btrim(answer)) between 40 and 1000),
  constraint ck_city_seo_faqs__order check(display_order between 0 and 100),
  constraint ck_city_seo_faqs__plain_text check(
    question !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and answer !~* '<[[:space:]]*(script|iframe|object|embed|style)'
  )
);

create table public.city_seo_routes (
  id uuid primary key default gen_random_uuid(),
  city_seo_content_id uuid not null references public.city_seo_contents(id) on delete cascade,
  route_label text not null,
  route_description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_city_seo_routes__content_order unique(city_seo_content_id,display_order),
  constraint ck_city_seo_routes__label check(char_length(btrim(route_label)) between 3 and 120),
  constraint ck_city_seo_routes__description check(char_length(btrim(route_description)) between 30 and 600),
  constraint ck_city_seo_routes__order check(display_order between 0 and 100),
  constraint ck_city_seo_routes__plain_text check(
    route_label !~* '<[[:space:]]*(script|iframe|object|embed|style)'
    and route_description !~* '<[[:space:]]*(script|iframe|object|embed|style)'
  )
);

create index idx_city_seo_contents__public_lookup
  on public.city_seo_contents(locale,slug,content_status,is_indexable);
create index idx_city_seo_contents__city_status
  on public.city_seo_contents(city_id,content_status,updated_at desc);
create index idx_city_seo_contents__updated_by
  on public.city_seo_contents(updated_by_profile_id) where updated_by_profile_id is not null;
create index idx_city_seo_faqs__content_order
  on public.city_seo_faqs(city_seo_content_id,display_order);
create index idx_city_seo_routes__content_order
  on public.city_seo_routes(city_seo_content_id,display_order);

create or replace function private.city_seo_readiness_issues(p_content uuid)
returns text[] language sql stable security definer set search_path='' as $$
  select array_remove(array[
    case when c.seo_title is null or char_length(btrim(c.seo_title)) not between 30 and 65 then 'seo_title' end,
    case when c.meta_description is null or char_length(btrim(c.meta_description)) not between 100 and 170 then 'meta_description' end,
    case when c.page_heading is null or char_length(btrim(c.page_heading)) not between 12 and 120 then 'page_heading' end,
    case when c.introduction is null or char_length(btrim(c.introduction)) < 180 then 'introduction' end,
    case when c.service_area_content is null or char_length(btrim(c.service_area_content)) < 180 then 'service_area_content' end,
    case when (coalesce(char_length(btrim(c.introduction)),0)+coalesce(char_length(btrim(c.service_area_content)),0)+coalesce(char_length(btrim(c.neighborhood_coverage_text)),0)) < 500 then 'editorial_depth' end,
    case when (select count(*) from public.city_seo_faqs f where f.city_seo_content_id=c.id) < 2 then 'faqs' end,
    case when lower(coalesce(c.seo_title,'')||' '||coalesce(c.page_heading,'')||' '||coalesce(c.introduction,'')||' '||coalesce(c.service_area_content,'')) ~ '(cheapest|#1|number one|best in saudi|guaranteed fastest|all.kingdom|الأرخص|رقم[[:space:]]*1|الأفضل في السعودية|الأسرع مضمون|جميع أنحاء المملكة)' then 'unsupported_claim' end
  ],null)
  from public.city_seo_contents c where c.id=p_content
$$;

create or replace function public.get_city_seo_readiness(p_content uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_actor uuid; v_issues text[];
begin
  v_actor:=private.require_portal_permission('settings.seo.read');
  select private.city_seo_readiness_issues(p_content) into v_issues;
  if v_issues is null then raise exception using errcode='P0002',message='SEO content not found'; end if;
  return jsonb_build_object('ready',cardinality(v_issues)=0,'issues',to_jsonb(v_issues));
end $$;

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs add constraint ck_lead_activity_logs__event_key check(event_key in (
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
  'staff_role_changed','staff_deactivated','staff_reactivated',
  'seo_content_updated','seo_content_status_changed','seo_indexability_changed'
));

insert into public.permissions(permission_key,description_ar,description_en,risk_level,status)
values
 ('settings.seo.read','عرض سجل محتوى تحسين الظهور المحلي','Read the local SEO content registry','medium','active'),
 ('settings.seo.manage','إدارة ونشر محتوى تحسين الظهور المحلي','Manage and publish local SEO content','critical','active')
on conflict(permission_key) do update set
 description_ar=excluded.description_ar,description_en=excluded.description_en,
 risk_level=excluded.risk_level,status='active',updated_at=now();

insert into public.role_permissions(role_id,permission_id,status,grant_reason)
select r.id,p.id,'active','SEO and Local SEO v1 approved Super Admin grant'
from public.roles r cross join public.permissions p
where r.role_key='super_admin' and p.permission_key in ('settings.seo.read','settings.seo.manage')
on conflict(role_id,permission_id) where status='active' do nothing;

insert into public.city_seo_contents(city_id,locale,slug)
select c.id,l.locale,c.slug from public.cities c cross join (values('ar'),('en')) l(locale)
where c.deleted_at is null
on conflict(city_id,locale) do nothing;

update public.city_seo_contents s set
  seo_title='خدمات نقل الأثاث والبضائع في الرياض | نقلك',
  meta_description='اطلب خدمات نقل الأثاث والبضائع داخل الرياض أو من الرياض إلى المدن المتاحة عبر نقلك، مع مراجعة الطلب وإرسال عرض سعر واضح قبل التنفيذ.',
  page_heading='خدمات النقل في الرياض مع نقلك',
  introduction='تساعدك نقلك على إرسال طلب نقل واضح داخل مدينة الرياض أو من الرياض إلى مدينة سعودية متاحة. يبدأ المسار بتحديد نوع الخدمة وعناوين الاستلام والتسليم وتفاصيل المنقولات، ثم يراجع فريق المبيعات الطلب قبل إعداد عرض السعر المناسب.',
  service_area_content='تشمل الخدمة الطلبات المؤهلة داخل أحياء الرياض، إضافة إلى الرحلات بين الرياض والمدن المفعلة ضمن نطاق التشغيل الحالي. يعتمد قبول الطلب والموعد النهائي على تفاصيل الحمولة والعناوين وتوفر الموارد، لذلك لا تعرض الصفحة وعوداً بالتغطية أو التسعير قبل مراجعة البيانات.',
  neighborhood_coverage_text='يمكن إدخال الحي والشارع وأقرب معلم في نموذج الطلب. تُراجع قابلية الوصول وملاحظات المبنى وموقع المركبة لكل طلب بدلاً من افتراض أن جميع العناوين متشابهة.',
  content_status='published',is_indexable=true,published_at=now(),updated_at=now()
from public.cities c where s.city_id=c.id and s.locale='ar' and c.city_code='RUH';

update public.city_seo_contents s set
  seo_title='Furniture and Goods Transport in Riyadh | Naqlk',
  meta_description='Request furniture moving and goods transport within Riyadh or from Riyadh to available Saudi cities, with request review and a clear quotation before execution.',
  page_heading='Transport services in Riyadh with Naqlk',
  introduction='Naqlk lets you submit a clear transport request within Riyadh or from Riyadh to an available Saudi city. Choose the service, provide pickup and delivery addresses, and describe the items so the Sales team can review the request before preparing a quotation.',
  service_area_content='Eligible requests include transport within Riyadh and journeys between Riyadh and cities enabled in the current operating scope. Final availability and scheduling depend on the load, addresses, and available resources, so this page does not promise coverage or pricing before review.',
  neighborhood_coverage_text='Add the district, street, building details, and a nearby landmark in the request. Access requirements and vehicle positioning are reviewed for each request instead of treating every Riyadh address as identical.',
  content_status='published',is_indexable=true,published_at=now(),updated_at=now()
from public.cities c where s.city_id=c.id and s.locale='en' and c.city_code='RUH';

insert into public.city_seo_faqs(city_seo_content_id,question,answer,display_order)
select s.id,v.question,v.answer,v.display_order
from public.city_seo_contents s join public.cities c on c.id=s.city_id
cross join lateral (values
 ('هل يمكن طلب نقل داخل مدينة الرياض؟','نعم، يمكن إرسال طلب نقل محلي بين عنواني استلام وتسليم مؤهلين داخل الرياض. يراجع الفريق تفاصيل العناوين والحمولة قبل تأكيد الخدمة.',10),
 ('هل تتوفر رحلات من الرياض إلى مدن أخرى؟','يمكن طلب النقل من الرياض إلى المدن المفعلة ضمن نطاق التشغيل الحالي. يعتمد تأكيد الرحلة على المدينة وتفاصيل الحمولة والموعد وتوفر الموارد.',20),
 ('كيف أحصل على عرض السعر؟','أرسل الطلب من خلال النموذج مع وصف المنقولات والعناوين. يراجع ممثل المبيعات البيانات ثم يرسل عرض سعر يتضمن البنود والضريبة والإجمالي.',30)
) v(question,answer,display_order)
where c.city_code='RUH' and s.locale='ar'
on conflict(city_seo_content_id,display_order) do nothing;

insert into public.city_seo_faqs(city_seo_content_id,question,answer,display_order)
select s.id,v.question,v.answer,v.display_order
from public.city_seo_contents s join public.cities c on c.id=s.city_id
cross join lateral (values
 ('Can I request transport within Riyadh?','Yes. You can submit a local request between eligible pickup and delivery addresses in Riyadh. The team reviews the addresses and cargo before confirming service.',10),
 ('Are trips available from Riyadh to other cities?','You can request transport from Riyadh to cities enabled in the current operating scope. Confirmation depends on the destination, cargo, schedule, and available resources.',20),
 ('How do I receive a quotation?','Submit the request form with the addresses and a useful cargo description. A Sales representative reviews it and sends an itemized quotation with VAT and the grand total.',30)
) v(question,answer,display_order)
where c.city_code='RUH' and s.locale='en'
on conflict(city_seo_content_id,display_order) do nothing;

insert into public.city_seo_routes(city_seo_content_id,route_label,route_description,display_order)
select s.id,v.label,v.description,v.display_order
from public.city_seo_contents s join public.cities c on c.id=s.city_id
cross join lateral (values
 ('داخل الرياض','نقل مؤهل بين أحياء الرياض بعد مراجعة عناوين الاستلام والتسليم ومتطلبات الوصول.',10),
 ('الرياض إلى المدن المتاحة','رحلات بين المدن تبدأ من الرياض إلى وجهة مفعلة ضمن نطاق التشغيل، بعد مراجعة تفاصيل الطلب.',20)
) v(label,description,display_order)
where c.city_code='RUH' and s.locale='ar'
on conflict(city_seo_content_id,display_order) do nothing;

insert into public.city_seo_routes(city_seo_content_id,route_label,route_description,display_order)
select s.id,v.label,v.description,v.display_order
from public.city_seo_contents s join public.cities c on c.id=s.city_id
cross join lateral (values
 ('Within Riyadh','Eligible moves between Riyadh districts after pickup, delivery, and access requirements are reviewed.',10),
 ('Riyadh to available cities','Intercity requests originating in Riyadh and ending in an enabled destination, subject to request review.',20)
) v(label,description,display_order)
where c.city_code='RUH' and s.locale='en'
on conflict(city_seo_content_id,display_order) do nothing;

create or replace function public.get_public_city_seo_content(p_locale text,p_slug text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_content public.city_seo_contents; v_city public.cities; v_issues text[];
begin
  if p_locale not in ('ar','en') or p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then return null; end if;
  select s.* into v_content
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  where s.locale=p_locale and s.slug=p_slug and s.content_status='published'
    and c.status='active' and c.deleted_at is null;
  if not found then return null; end if;
  select c.* into v_city from public.cities c where c.id=v_content.city_id;
  v_issues:=private.city_seo_readiness_issues(v_content.id);
  return jsonb_build_object(
    'id',v_content.id,'city_id',v_city.id,'slug',v_content.slug,'locale',v_content.locale,
    'city_name',case when p_locale='ar' then v_city.name_ar else v_city.name_en end,
    'region_name',case when p_locale='ar' then v_city.region_ar else v_city.region_en end,
    'seo_title',v_content.seo_title,'meta_description',v_content.meta_description,
    'page_heading',v_content.page_heading,'introduction',v_content.introduction,
    'service_area_content',v_content.service_area_content,
    'neighborhood_coverage_text',v_content.neighborhood_coverage_text,
    'is_indexable',v_content.is_indexable and cardinality(v_issues)=0,
    'updated_at',v_content.updated_at,
    'faqs',(select coalesce(jsonb_agg(jsonb_build_object('question',f.question,'answer',f.answer) order by f.display_order),'[]'::jsonb) from public.city_seo_faqs f where f.city_seo_content_id=v_content.id),
    'routes',(select coalesce(jsonb_agg(jsonb_build_object('label',r.route_label,'description',r.route_description) order by r.display_order),'[]'::jsonb) from public.city_seo_routes r where r.city_seo_content_id=v_content.id),
    'alternates',(select coalesce(jsonb_object_agg(a.locale,a.slug),'{}'::jsonb) from public.city_seo_contents a where a.city_id=v_city.id and a.content_status='published' and a.is_indexable and cardinality(private.city_seo_readiness_issues(a.id))=0)
  );
end $$;

create or replace function public.get_indexable_city_seo_index(p_locale text default null)
returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'city_id',s.city_id,'locale',s.locale,'slug',s.slug,
    'city_name',case when s.locale='ar' then c.name_ar else c.name_en end,
    'region_name',case when s.locale='ar' then c.region_ar else c.region_en end,
    'updated_at',s.updated_at
  ) order by c.display_order,s.locale),'[]'::jsonb)
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  where (p_locale is null or s.locale=p_locale) and s.content_status='published' and s.is_indexable
    and c.status='active' and c.deleted_at is null
    and cardinality(private.city_seo_readiness_issues(s.id))=0
$$;

create or replace function public.admin_list_city_seo_contents()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  perform private.require_portal_permission('settings.seo.read');
  return jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',s.id,'city_id',c.id,'city_code',c.city_code,'city_status',c.status,
    'city_name_ar',c.name_ar,'city_name_en',c.name_en,'locale',s.locale,'slug',s.slug,
    'seo_title',s.seo_title,'meta_description',s.meta_description,'page_heading',s.page_heading,
    'introduction',s.introduction,'service_area_content',s.service_area_content,
    'neighborhood_coverage_text',s.neighborhood_coverage_text,'content_status',s.content_status,
    'is_indexable',s.is_indexable,'updated_at',s.updated_at,'version',s.version,
    'readiness_issues',to_jsonb(private.city_seo_readiness_issues(s.id)),
    'faqs',(select coalesce(jsonb_agg(jsonb_build_object('question',f.question,'answer',f.answer) order by f.display_order),'[]'::jsonb) from public.city_seo_faqs f where f.city_seo_content_id=s.id),
    'routes',(select coalesce(jsonb_agg(jsonb_build_object('label',r.route_label,'description',r.route_description) order by r.display_order),'[]'::jsonb) from public.city_seo_routes r where r.city_seo_content_id=s.id)
  ) order by c.display_order,s.locale) from public.city_seo_contents s join public.cities c on c.id=s.city_id where c.deleted_at is null),'[]'::jsonb));
end $$;

create or replace function public.admin_upsert_city_seo_content(
  p_content uuid,p_slug text,p_seo_title text,p_meta_description text,p_page_heading text,
  p_introduction text,p_service_area_content text,p_neighborhood_coverage_text text,
  p_faqs jsonb default '[]'::jsonb,p_routes jsonb default '[]'::jsonb,p_expected_version integer default null
)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_current public.city_seo_contents; v_faq jsonb; v_route jsonb; v_order integer:=0;
begin
  v_actor:=private.require_portal_permission('settings.seo.manage');
  select * into v_current from public.city_seo_contents where id=p_content for update;
  if not found then raise exception using errcode='P0002',message='SEO content not found'; end if;
  if p_expected_version is not null and v_current.version<>p_expected_version then raise exception using errcode='40001',message='SEO content changed'; end if;
  if jsonb_typeof(p_faqs)<>'array' or jsonb_array_length(p_faqs)>12 or jsonb_typeof(p_routes)<>'array' or jsonb_array_length(p_routes)>12 then raise exception using errcode='22023',message='Invalid structured content'; end if;
  update public.city_seo_contents set slug=lower(btrim(p_slug)),seo_title=nullif(btrim(p_seo_title),''),meta_description=nullif(btrim(p_meta_description),''),page_heading=nullif(btrim(p_page_heading),''),introduction=nullif(btrim(p_introduction),''),service_area_content=nullif(btrim(p_service_area_content),''),neighborhood_coverage_text=nullif(btrim(p_neighborhood_coverage_text),''),content_status='draft',is_indexable=false,published_at=null,updated_at=now(),updated_by_profile_id=v_actor,version=version+1 where id=p_content;
  delete from public.city_seo_faqs where city_seo_content_id=p_content;
  for v_faq in select value from jsonb_array_elements(p_faqs) loop
    v_order:=v_order+10;
    insert into public.city_seo_faqs(city_seo_content_id,question,answer,display_order) values(p_content,btrim(v_faq->>'question'),btrim(v_faq->>'answer'),v_order);
  end loop;
  v_order:=0;
  delete from public.city_seo_routes where city_seo_content_id=p_content;
  for v_route in select value from jsonb_array_elements(p_routes) loop
    v_order:=v_order+10;
    insert into public.city_seo_routes(city_seo_content_id,route_label,route_description,display_order) values(p_content,btrim(v_route->>'label'),btrim(v_route->>'description'),v_order);
  end loop;
  perform private.write_platform_activity('settings','seo_content_updated','city_seo_content',p_content,v_actor,jsonb_build_object('locale',v_current.locale,'city_id',v_current.city_id));
  return jsonb_build_object('state','draft','id',p_content,'version',v_current.version+1,'readiness_issues',to_jsonb(private.city_seo_readiness_issues(p_content)));
end $$;

create or replace function public.admin_set_city_seo_state(p_content uuid,p_status text,p_indexable boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_current public.city_seo_contents; v_city_status text; v_issues text[];
begin
  v_actor:=private.require_portal_permission('settings.seo.manage');
  if p_status not in ('draft','ready','published') then raise exception using errcode='22023',message='Invalid SEO state'; end if;
  select s.* into v_current from public.city_seo_contents s where s.id=p_content for update;
  if not found then raise exception using errcode='P0002',message='SEO content not found'; end if;
  select c.status into v_city_status from public.cities c where c.id=v_current.city_id;
  v_issues:=private.city_seo_readiness_issues(p_content);
  if p_status in ('ready','published') and cardinality(v_issues)>0 then raise exception using errcode='23514',message='SEO content is not ready'; end if;
  if p_indexable and (p_status<>'published' or v_city_status<>'active') then raise exception using errcode='23514',message='SEO content is not indexable'; end if;
  update public.city_seo_contents set content_status=p_status,is_indexable=case when p_status='published' then p_indexable else false end,published_at=case when p_status='published' then coalesce(published_at,now()) else null end,updated_at=now(),updated_by_profile_id=v_actor,version=version+1 where id=p_content;
  perform private.write_platform_activity('settings','seo_content_status_changed','city_seo_content',p_content,v_actor,jsonb_build_object('from',v_current.content_status,'to',p_status));
  if v_current.is_indexable is distinct from (p_status='published' and p_indexable) then perform private.write_platform_activity('settings','seo_indexability_changed','city_seo_content',p_content,v_actor,jsonb_build_object('indexable',p_status='published' and p_indexable)); end if;
  return jsonb_build_object('state',p_status,'indexable',p_status='published' and p_indexable);
end $$;

create or replace function public.admin_update_service_area(p_city uuid,p_status text,p_display_order integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid; v_disabled integer:=0;
begin
  v_actor:=private.require_portal_permission('settings.business.manage');
  if p_status not in ('active','inactive') or p_display_order not between 0 and 10000 then raise exception using errcode='22023',message='Invalid service area'; end if;
  update public.cities set status=p_status,display_order=p_display_order,updated_by_profile_id=v_actor where id=p_city and deleted_at is null;
  if not found then raise exception using errcode='P0002',message='Service area not found'; end if;
  if p_status='inactive' then
    update public.city_seo_contents set is_indexable=false,updated_at=now(),updated_by_profile_id=v_actor,version=version+1 where city_id=p_city and is_indexable;
    get diagnostics v_disabled=row_count;
  end if;
  perform private.write_platform_activity('settings','service_area_changed','city',p_city,v_actor,jsonb_build_object('status',p_status,'display_order',p_display_order,'seo_indexability_disabled',v_disabled));
  return jsonb_build_object('state','updated','seo_indexability_disabled',v_disabled);
end $$;

alter table public.city_seo_contents enable row level security;
alter table public.city_seo_faqs enable row level security;
alter table public.city_seo_routes enable row level security;

revoke all on table public.city_seo_contents,public.city_seo_faqs,public.city_seo_routes from public,anon,authenticated;
grant all on table public.city_seo_contents,public.city_seo_faqs,public.city_seo_routes to service_role;

revoke all on function public.get_public_city_seo_content(text,text),public.get_indexable_city_seo_index(text) from public,anon,authenticated;
grant execute on function public.get_public_city_seo_content(text,text),public.get_indexable_city_seo_index(text) to anon,authenticated,service_role;

revoke all on function public.get_city_seo_readiness(uuid),public.admin_list_city_seo_contents(),public.admin_upsert_city_seo_content(uuid,text,text,text,text,text,text,text,jsonb,jsonb,integer),public.admin_set_city_seo_state(uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.get_city_seo_readiness(uuid),public.admin_list_city_seo_contents(),public.admin_upsert_city_seo_content(uuid,text,text,text,text,text,text,text,jsonb,jsonb,integer),public.admin_set_city_seo_state(uuid,text,boolean) to authenticated;

grant execute on function public.get_city_seo_readiness(uuid),public.admin_list_city_seo_contents(),public.admin_upsert_city_seo_content(uuid,text,text,text,text,text,text,text,jsonb,jsonb,integer),public.admin_set_city_seo_state(uuid,text,boolean) to service_role;

comment on table public.city_seo_contents is 'Localized, editorially governed City SEO registry. Operational city status never implies indexability.';
comment on table public.city_seo_faqs is 'Visible localized City Page FAQs stored relationally for validation and truthful FAQ structured data.';
comment on table public.city_seo_routes is 'Optional editorial descriptions of genuine common transport routes; not operational coverage promises.';
comment on function public.get_public_city_seo_content(text,text) is 'Narrow anonymous City Page projection with no staff, customer, or internal identifiers.';
comment on function public.get_indexable_city_seo_index(text) is 'Published and editorially ready City Page index used by sitemap and internal links.';

commit;
