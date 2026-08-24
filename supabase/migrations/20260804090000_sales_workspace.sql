begin;

-- Sprint 4 deliberately keeps the Sales workspace behind command functions.
-- It adds no operational, finance, payment, or dispatch capabilities.

insert into public.permissions (
  permission_key,
  description_ar,
  description_en,
  risk_level,
  status
)
values
  (
    'sales.workspace.read',
    'عرض بيانات الطلبات وعروض الأسعار داخل مساحة عمل المبيعات.',
    'View Leads and Quotations inside the Sales workspace.',
    'medium',
    'active'
  ),
  (
    'sales.workspace.manage',
    'إنشاء وتعديل وإرسال مسودات عروض الأسعار داخل مساحة عمل المبيعات.',
    'Create, update, and issue draft Quotations inside the Sales workspace.',
    'high',
    'active'
  )
on conflict (permission_key) do update
set
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  risk_level = excluded.risk_level,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (
  role_id,
  permission_id,
  status,
  grant_reason
)
select
  roles.id,
  permissions.id,
  'active',
  'Sprint 4 Sales workspace access'
from public.roles
cross join public.permissions
where roles.role_key in ('sales', 'super_admin')
  and permissions.permission_key in ('sales.workspace.read', 'sales.workspace.manage')
on conflict (role_id, permission_id) where status = 'active' do nothing;

alter table public.quotations
  add column vat_rate numeric(5, 4);

update public.quotations
set vat_rate = case
  when subtotal_amount > 0 then round(tax_amount / subtotal_amount, 4)
  else 0
end;

alter table public.quotations
  alter column vat_rate set not null,
  add constraint ck_quotations__vat_rate check (vat_rate between 0 and 1);

create table public.quotation_line_items (
  id uuid not null default gen_random_uuid(),
  quotation_id uuid not null,
  line_number integer not null,
  description text not null,
  quantity numeric(12, 3) not null,
  unit_price numeric(12, 2) not null,
  line_total_amount numeric(12, 2) generated always as (round(quantity * unit_price, 2)) stored,
  created_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  constraint pk_quotation_line_items primary key (id),
  constraint uq_quotation_line_items__quotation_id_line_number
    unique (quotation_id, line_number),
  constraint fk_quotation_line_items__quotation_id__quotations
    foreign key (quotation_id) references public.quotations (id) on delete restrict,
  constraint fk_quotation_line_items__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_quotation_line_items__line_number check (line_number between 1 and 100),
  constraint ck_quotation_line_items__description
    check (char_length(btrim(description)) between 2 and 500),
  constraint ck_quotation_line_items__quantity check (quantity > 0 and quantity <= 100000),
  constraint ck_quotation_line_items__unit_price check (unit_price >= 0 and unit_price <= 9999999999.99)
);

create table public.lead_activity_logs (
  id uuid not null default gen_random_uuid(),
  lead_id uuid not null,
  quotation_id uuid,
  event_key text not null,
  actor_profile_id uuid,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint pk_lead_activity_logs primary key (id),
  constraint fk_lead_activity_logs__lead_id__leads
    foreign key (lead_id) references public.leads (id) on delete restrict,
  constraint fk_lead_activity_logs__quotation_id__quotations
    foreign key (quotation_id) references public.quotations (id) on delete restrict,
  constraint fk_lead_activity_logs__actor_profile_id__profiles
    foreign key (actor_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_lead_activity_logs__event_key check (
    event_key in (
      'lead_created',
      'lead_viewed',
      'lead_qualified',
      'lead_quoted',
      'lead_order_ready',
      'lead_closed',
      'lead_cancelled',
      'quotation_draft_created',
      'quotation_draft_updated',
      'quotation_sent',
      'quotation_approved',
      'quotation_rejected',
      'quotation_expired',
      'quotation_superseded',
      'quotation_cancelled'
    )
  ),
  constraint ck_lead_activity_logs__details check (jsonb_typeof(details) = 'object')
);

create table public.lead_workspace_views (
  lead_id uuid not null,
  profile_id uuid not null,
  last_viewed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pk_lead_workspace_views primary key (lead_id, profile_id),
  constraint fk_lead_workspace_views__lead_id__leads
    foreign key (lead_id) references public.leads (id) on delete restrict,
  constraint fk_lead_workspace_views__profile_id__profiles
    foreign key (profile_id) references public.profiles (id) on delete restrict
);

create index idx_quotation_line_items__quotation_id_line_number
  on public.quotation_line_items (quotation_id, line_number);
create index idx_lead_activity_logs__lead_id_occurred_at
  on public.lead_activity_logs (lead_id, occurred_at desc);
create index idx_lead_activity_logs__quotation_id_occurred_at
  on public.lead_activity_logs (quotation_id, occurred_at desc)
  where quotation_id is not null;
create index idx_lead_workspace_views__profile_id_last_viewed_at
  on public.lead_workspace_views (profile_id, last_viewed_at desc);
create index idx_leads__sales_search
  on public.leads (submitted_at desc, reference_number, mobile_number);

create or replace function private.validate_quotation_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.status <> 'draft' then
    raise exception using errcode = '23514', message = 'New Quotations must start as draft';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.quotation_number <> old.quotation_number
      or new.lead_id <> old.lead_id
      or new.revision_number <> old.revision_number
    then
      raise exception using errcode = '23514', message = 'Quotation identity is immutable';
    end if;

    if old.status <> 'draft'
      and (
        new.currency <> old.currency
        or new.subtotal_amount <> old.subtotal_amount
        or new.tax_amount <> old.tax_amount
        or new.quoted_amount <> old.quoted_amount
        or new.vat_rate <> old.vat_rate
        or new.expires_at <> old.expires_at
        or new.terms_ar <> old.terms_ar
        or new.terms_en <> old.terms_en
      )
    then
      raise exception using errcode = '23514', message = 'Issued Quotation commercial terms are immutable';
    end if;

    if new.status is distinct from old.status
      and not (
        (old.status = 'draft' and new.status in ('sent', 'cancelled'))
        or (old.status = 'sent' and new.status in ('approved', 'rejected', 'expired', 'superseded'))
      )
    then
      raise exception using errcode = '23514', message = 'Unsupported Quotation status transition';
    end if;
  end if;

  if new.status not in ('draft', 'cancelled') and new.sent_at is null then
    new.sent_at := now();
  end if;

  if new.status = 'approved' then
    if tg_op = 'INSERT' or old.status <> 'approved' then
      if auth.role() = 'authenticated'
        and not public.has_permission('quotation.record.approve')
      then
        raise exception using errcode = '42501', message = 'Quotation approval permission is required';
      end if;

      new.approved_at := now();
      new.approved_by_profile_id := public.current_profile_id();
    end if;

    if new.expires_at <= now() then
      raise exception using errcode = '23514', message = 'Expired Quotations cannot be approved';
    end if;
  else
    new.approved_at := null;
    new.approved_by_profile_id := null;
  end if;

  return new;
end;
$$;

create or replace function private.require_sales_workspace_permission(
  requested_permission text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
begin
  if auth.role() <> 'authenticated'
    or not private.has_permission_authoritative(requested_permission)
  then
    raise exception using
      errcode = '42501',
      message = 'Sales workspace permission is required';
  end if;

  actor_profile_id := private.current_profile_id_authoritative();

  if actor_profile_id is null then
    raise exception using errcode = '42501', message = 'An active staff profile is required';
  end if;

  return actor_profile_id;
end;
$$;

create or replace function private.write_lead_activity(
  p_lead_id uuid,
  p_event_key text,
  p_actor_profile_id uuid default null,
  p_quotation_id uuid default null,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity_id uuid;
begin
  insert into public.lead_activity_logs (
    lead_id,
    quotation_id,
    event_key,
    actor_profile_id,
    details
  )
  values (
    p_lead_id,
    p_quotation_id,
    p_event_key,
    p_actor_profile_id,
    coalesce(p_details, '{}'::jsonb)
  )
  returning id into activity_id;

  return activity_id;
end;
$$;

create or replace function private.record_lead_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
begin
  if tg_op = 'INSERT' then
    perform private.write_lead_activity(
      new.id,
      'lead_created',
      new.created_by_profile_id,
      null,
      jsonb_build_object('source', new.source, 'status', new.status)
    );
    return new;
  end if;

  if new.status is distinct from old.status then
    event_name := case new.status
      when 'qualified' then 'lead_qualified'
      when 'quoted' then 'lead_quoted'
      when 'converted' then 'lead_order_ready'
      when 'closed' then 'lead_closed'
      when 'cancelled' then 'lead_cancelled'
      else null
    end;

    if event_name is not null then
      perform private.write_lead_activity(
        new.id,
        event_name,
        new.updated_by_profile_id,
        null,
        jsonb_build_object('from_status', old.status, 'to_status', new.status)
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.record_quotation_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
begin
  if tg_op = 'INSERT' then
    perform private.write_lead_activity(
      new.lead_id,
      'quotation_draft_created',
      new.created_by_profile_id,
      new.id,
      jsonb_build_object('revision_number', new.revision_number, 'quotation_number', new.quotation_number)
    );
    return new;
  end if;

  if new.status is distinct from old.status then
    event_name := case new.status
      when 'sent' then 'quotation_sent'
      when 'approved' then 'quotation_approved'
      when 'rejected' then 'quotation_rejected'
      when 'expired' then 'quotation_expired'
      when 'superseded' then 'quotation_superseded'
      when 'cancelled' then 'quotation_cancelled'
      else null
    end;

    if event_name is not null then
      perform private.write_lead_activity(
        new.lead_id,
        event_name,
        new.updated_by_profile_id,
        new.id,
        jsonb_build_object(
          'quotation_number', new.quotation_number,
          'revision_number', new.revision_number,
          'from_status', old.status,
          'to_status', new.status
        )
      );
    end if;

    if new.status = 'approved' and old.status <> 'approved' then
      update public.leads
      set status = 'converted'
      where id = new.lead_id
        and status = 'quoted';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_leads__after_insert_update__activity
after insert or update on public.leads
for each row execute function private.record_lead_activity();

create trigger trg_quotations__after_insert_update__activity
after insert or update on public.quotations
for each row execute function private.record_quotation_activity();

insert into public.lead_activity_logs (
  lead_id,
  event_key,
  actor_profile_id,
  details,
  occurred_at,
  created_at
)
select
  leads.id,
  'lead_created',
  leads.created_by_profile_id,
  jsonb_build_object('source', leads.source, 'status', leads.status, 'backfilled', true),
  leads.submitted_at,
  now()
from public.leads
where not exists (
  select 1
  from public.lead_activity_logs
  where lead_activity_logs.lead_id = leads.id
    and lead_activity_logs.event_key = 'lead_created'
);

create or replace function public.sales_list_lead_inbox(
  p_page integer default 1,
  p_page_size integer default 20,
  p_search text default null,
  p_status text default null,
  p_service_id uuid default null,
  p_city_id uuid default null,
  p_sort_by text default 'submitted_at',
  p_sort_direction text default 'desc'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  page_number integer := greatest(coalesce(p_page, 1), 1);
  page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 100);
  offset_rows integer;
  result jsonb;
begin
  perform private.require_sales_workspace_permission('sales.workspace.read');

  if p_status is not null
    and p_status not in ('new', 'qualified', 'quoted', 'converted', 'closed', 'cancelled')
  then
    raise exception using errcode = '22023', message = 'Unsupported Lead status filter';
  end if;

  if p_sort_by not in ('submitted_at', 'customer_name', 'reference_number', 'status')
    or lower(coalesce(p_sort_direction, 'desc')) not in ('asc', 'desc')
  then
    raise exception using errcode = '22023', message = 'Unsupported Lead Inbox sort';
  end if;

  offset_rows := (page_number - 1) * page_size;

  with filtered as (
    select
      leads.id,
      leads.reference_number,
      leads.customer_name,
      leads.mobile_number,
      leads.status,
      leads.submitted_at,
      leads.updated_at,
      services.name_ar as service_name_ar,
      services.name_en as service_name_en,
      pickup_cities.name_ar as city_name_ar,
      pickup_cities.name_en as city_name_en,
      case
        when workspace_views.last_viewed_at is null then true
        when workspace_views.last_viewed_at < leads.updated_at then true
        else false
      end as is_unread
    from public.leads
    join public.services on services.id = leads.service_id
    join public.addresses as pickup_addresses on pickup_addresses.id = leads.pickup_address_id
    join public.cities as pickup_cities on pickup_cities.id = pickup_addresses.city_id
    left join public.lead_workspace_views as workspace_views
      on workspace_views.lead_id = leads.id
      and workspace_views.profile_id = private.current_profile_id_authoritative()
    where (
      nullif(btrim(coalesce(p_search, '')), '') is null
      or leads.reference_number ilike '%' || btrim(p_search) || '%'
      or leads.customer_name ilike '%' || btrim(p_search) || '%'
      or leads.mobile_number ilike '%' || btrim(p_search) || '%'
    )
      and (p_status is null or leads.status = p_status)
      and (p_service_id is null or leads.service_id = p_service_id)
      and (p_city_id is null or pickup_addresses.city_id = p_city_id)
  ),
  paged as (
    select *
    from filtered
    order by
      case when p_sort_by = 'submitted_at' and lower(p_sort_direction) = 'asc' then submitted_at end asc,
      case when p_sort_by = 'submitted_at' and lower(p_sort_direction) = 'desc' then submitted_at end desc,
      case when p_sort_by = 'customer_name' and lower(p_sort_direction) = 'asc' then customer_name end asc,
      case when p_sort_by = 'customer_name' and lower(p_sort_direction) = 'desc' then customer_name end desc,
      case when p_sort_by = 'reference_number' and lower(p_sort_direction) = 'asc' then reference_number end asc,
      case when p_sort_by = 'reference_number' and lower(p_sort_direction) = 'desc' then reference_number end desc,
      case when p_sort_by = 'status' and lower(p_sort_direction) = 'asc' then status end asc,
      case when p_sort_by = 'status' and lower(p_sort_direction) = 'desc' then status end desc,
      submitted_at desc,
      id asc
    limit page_size offset offset_rows
  )
  select jsonb_build_object(
    'page', page_number,
    'page_size', page_size,
    'total', (select count(*) from filtered),
    'items', coalesce(
      (
        select jsonb_agg(to_jsonb(paged) order by paged.submitted_at desc, paged.id asc)
        from paged
      ),
      '[]'::jsonb
    )
  ) into result;

  return result;
end;
$$;

create or replace function public.sales_get_lead_detail(p_lead_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_sales_workspace_permission('sales.workspace.read');

  select jsonb_build_object(
    'lead', to_jsonb(leads) || jsonb_build_object(
      'service', jsonb_build_object(
        'id', services.id,
        'name_ar', services.name_ar,
        'name_en', services.name_en
      )
    ),
    'pickup_address', to_jsonb(pickup_addresses) || jsonb_build_object(
      'city', jsonb_build_object('id', pickup_cities.id, 'name_ar', pickup_cities.name_ar, 'name_en', pickup_cities.name_en)
    ),
    'delivery_address', to_jsonb(delivery_addresses) || jsonb_build_object(
      'city', jsonb_build_object('id', delivery_cities.id, 'name_ar', delivery_cities.name_ar, 'name_en', delivery_cities.name_en)
    ),
    'attachments', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', attachments.id,
            'original_filename', attachments.original_filename,
            'mime_type', attachments.mime_type,
            'size_bytes', attachments.size_bytes,
            'storage_bucket', attachments.storage_bucket,
            'storage_path', attachments.storage_path,
            'status', attachments.status,
            'uploaded_at', attachments.uploaded_at
          ) order by attachments.uploaded_at asc
        )
        from public.lead_attachments as attachments
        where attachments.lead_id = leads.id
          and attachments.deleted_at is null
      ),
      '[]'::jsonb
    ),
    'quotations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', quotations.id,
            'quotation_number', quotations.quotation_number,
            'revision_number', quotations.revision_number,
            'status', case when quotations.status = 'sent' and quotations.expires_at <= now() then 'expired' else quotations.status end,
            'currency', quotations.currency,
            'subtotal_amount', quotations.subtotal_amount,
            'tax_amount', quotations.tax_amount,
            'vat_rate', quotations.vat_rate,
            'quoted_amount', quotations.quoted_amount,
            'expires_at', quotations.expires_at,
            'sent_at', quotations.sent_at,
            'approved_at', quotations.approved_at,
            'internal_notes', quotations.internal_notes,
            'customer_notes', quotations.customer_notes,
            'terms_ar', quotations.terms_ar,
            'terms_en', quotations.terms_en,
            'created_at', quotations.created_at,
            'updated_at', quotations.updated_at,
            'line_items', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', line_items.id,
                    'line_number', line_items.line_number,
                    'description', line_items.description,
                    'quantity', line_items.quantity,
                    'unit_price', line_items.unit_price,
                    'line_total_amount', line_items.line_total_amount
                  ) order by line_items.line_number asc
                )
                from public.quotation_line_items as line_items
                where line_items.quotation_id = quotations.id
              ),
              '[]'::jsonb
            )
          ) order by quotations.revision_number desc
        )
        from public.quotations
        where quotations.lead_id = leads.id
      ),
      '[]'::jsonb
    ),
    'activity_log', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', activity_logs.id,
            'event_key', activity_logs.event_key,
            'details', activity_logs.details,
            'occurred_at', activity_logs.occurred_at,
            'actor', case when actors.id is null then null else jsonb_build_object('id', actors.id, 'display_name', actors.display_name) end
          ) order by activity_logs.occurred_at desc, activity_logs.id desc
        )
        from public.lead_activity_logs as activity_logs
        left join public.profiles as actors on actors.id = activity_logs.actor_profile_id
        where activity_logs.lead_id = leads.id
      ),
      '[]'::jsonb
    )
  ) into result
  from public.leads
  join public.services on services.id = leads.service_id
  join public.addresses as pickup_addresses on pickup_addresses.id = leads.pickup_address_id
  join public.cities as pickup_cities on pickup_cities.id = pickup_addresses.city_id
  join public.addresses as delivery_addresses on delivery_addresses.id = leads.delivery_address_id
  join public.cities as delivery_cities on delivery_cities.id = delivery_addresses.city_id
  where leads.id = p_lead_id;

  if result is null then
    raise exception using errcode = 'P0002', message = 'Lead not found';
  end if;

  return result;
end;
$$;

create or replace function public.sales_mark_lead_viewed(p_lead_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
begin
  actor_profile_id := private.require_sales_workspace_permission('sales.workspace.read');

  if not exists (select 1 from public.leads where id = p_lead_id) then
    raise exception using errcode = 'P0002', message = 'Lead not found';
  end if;

  insert into public.lead_workspace_views (lead_id, profile_id, last_viewed_at, updated_at)
  values (p_lead_id, actor_profile_id, now(), now())
  on conflict (lead_id, profile_id) do update
  set last_viewed_at = excluded.last_viewed_at, updated_at = excluded.updated_at;

  perform private.write_lead_activity(
    p_lead_id,
    'lead_viewed',
    actor_profile_id,
    null,
    '{}'::jsonb
  );

  return true;
end;
$$;

create or replace function public.sales_save_quotation(
  p_lead_id uuid,
  p_quotation_id uuid default null,
  p_draft_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  currency_code text;
  customer_notes_value text;
  expires_at_value timestamp with time zone;
  internal_notes_value text;
  line_item jsonb;
  line_number_value integer := 0;
  line_quantity numeric(12, 3);
  line_description text;
  line_unit_price numeric(12, 2);
  quotation_id_value uuid;
  quotation_row public.quotations%rowtype;
  revision_number_value integer;
  subtotal_value numeric(12, 2) := 0;
  tax_amount_value numeric(12, 2);
  terms_ar_value text;
  terms_en_value text;
  total_amount_value numeric(12, 2);
  vat_rate_value numeric(5, 4);
begin
  actor_profile_id := private.require_sales_workspace_permission('sales.workspace.manage');

  if jsonb_typeof(p_draft_payload) <> 'object'
    or jsonb_typeof(p_draft_payload -> 'line_items') <> 'array'
  then
    raise exception using errcode = '22023', message = 'Quotation draft payload is invalid';
  end if;

  perform 1 from public.leads where id = p_lead_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Lead not found';
  end if;

  if jsonb_array_length(p_draft_payload -> 'line_items') not between 1 and 100 then
    raise exception using errcode = '22023', message = 'A Quotation requires between one and one hundred line items';
  end if;

  currency_code := upper(coalesce(nullif(btrim(p_draft_payload ->> 'currency'), ''), 'SAR'));
  if currency_code !~ '^[A-Z]{3}$' then
    raise exception using errcode = '22023', message = 'Quotation currency is invalid';
  end if;

  if coalesce(p_draft_payload ->> 'vat_rate', '') !~ '^[0-9]+(\.[0-9]{1,4})?$' then
    raise exception using errcode = '22023', message = 'Quotation VAT rate is invalid';
  end if;
  vat_rate_value := (p_draft_payload ->> 'vat_rate')::numeric;
  if vat_rate_value < 0 or vat_rate_value > 1 then
    raise exception using errcode = '22023', message = 'Quotation VAT rate is outside the supported range';
  end if;

  begin
    expires_at_value := (p_draft_payload ->> 'expires_at')::timestamp with time zone;
  exception when others then
    raise exception using errcode = '22023', message = 'Quotation expiry is invalid';
  end;
  if expires_at_value <= now() then
    raise exception using errcode = '22023', message = 'Quotation expiry must be in the future';
  end if;

  internal_notes_value := nullif(btrim(coalesce(p_draft_payload ->> 'internal_notes', '')), '');
  customer_notes_value := nullif(btrim(coalesce(p_draft_payload ->> 'customer_notes', '')), '');
  terms_ar_value := coalesce(
    nullif(btrim(coalesce(p_draft_payload ->> 'terms_ar', '')), ''),
    'يسري هذا العرض حتى تاريخ الانتهاء الموضح أعلاه.'
  );
  terms_en_value := coalesce(
    nullif(btrim(coalesce(p_draft_payload ->> 'terms_en', '')), ''),
    'This quotation remains valid until the expiry date shown above.'
  );

  if char_length(terms_ar_value) not between 8 and 10000
    or char_length(terms_en_value) not between 8 and 10000
  then
    raise exception using errcode = '22023', message = 'Quotation terms are invalid';
  end if;

  for line_item in select value from jsonb_array_elements(p_draft_payload -> 'line_items') loop
    line_number_value := line_number_value + 1;
    line_description := btrim(coalesce(line_item ->> 'description', ''));
    if char_length(line_description) not between 2 and 500 then
      raise exception using errcode = '22023', message = 'Quotation line item description is invalid';
    end if;

    if coalesce(line_item ->> 'quantity', '') !~ '^[0-9]+(\.[0-9]{1,3})?$'
      or coalesce(line_item ->> 'unit_price', '') !~ '^[0-9]+(\.[0-9]{1,2})?$'
    then
      raise exception using errcode = '22023', message = 'Quotation line item amounts are invalid';
    end if;

    line_quantity := (line_item ->> 'quantity')::numeric;
    line_unit_price := (line_item ->> 'unit_price')::numeric;
    if line_quantity <= 0 or line_quantity > 100000
      or line_unit_price < 0 or line_unit_price > 9999999999.99
    then
      raise exception using errcode = '22023', message = 'Quotation line item amounts are outside the supported range';
    end if;

    subtotal_value := subtotal_value + round(line_quantity * line_unit_price, 2);
  end loop;

  subtotal_value := round(subtotal_value, 2);
  if subtotal_value <= 0 then
    raise exception using errcode = '22023', message = 'Quotation total must be greater than zero';
  end if;
  tax_amount_value := round(subtotal_value * vat_rate_value, 2);
  total_amount_value := subtotal_value + tax_amount_value;

  if p_quotation_id is null then
    select coalesce(max(revision_number), 0) + 1
    into revision_number_value
    from public.quotations
    where lead_id = p_lead_id;

    insert into public.quotations (
      lead_id,
      revision_number,
      status,
      currency,
      subtotal_amount,
      tax_amount,
      vat_rate,
      quoted_amount,
      expires_at,
      internal_notes,
      customer_notes,
      terms_ar,
      terms_en
    )
    values (
      p_lead_id,
      revision_number_value,
      'draft',
      currency_code,
      subtotal_value,
      tax_amount_value,
      vat_rate_value,
      total_amount_value,
      expires_at_value,
      internal_notes_value,
      customer_notes_value,
      terms_ar_value,
      terms_en_value
    )
    returning * into quotation_row;
  else
    select * into quotation_row
    from public.quotations
    where id = p_quotation_id
      and lead_id = p_lead_id
    for update;

    if not found then
      raise exception using errcode = 'P0002', message = 'Quotation draft not found';
    end if;
    if quotation_row.status <> 'draft' then
      raise exception using errcode = '23514', message = 'Only a draft Quotation may be edited';
    end if;

    update public.quotations
    set
      currency = currency_code,
      subtotal_amount = subtotal_value,
      tax_amount = tax_amount_value,
      vat_rate = vat_rate_value,
      quoted_amount = total_amount_value,
      expires_at = expires_at_value,
      internal_notes = internal_notes_value,
      customer_notes = customer_notes_value,
      terms_ar = terms_ar_value,
      terms_en = terms_en_value
    where id = quotation_row.id
    returning * into quotation_row;

    perform private.write_lead_activity(
      p_lead_id,
      'quotation_draft_updated',
      actor_profile_id,
      quotation_row.id,
      jsonb_build_object('revision_number', quotation_row.revision_number)
    );

    delete from public.quotation_line_items
    where quotation_id = quotation_row.id;
  end if;

  quotation_id_value := quotation_row.id;
  line_number_value := 0;
  for line_item in select value from jsonb_array_elements(p_draft_payload -> 'line_items') loop
    line_number_value := line_number_value + 1;
    insert into public.quotation_line_items (
      quotation_id,
      line_number,
      description,
      quantity,
      unit_price,
      created_by_profile_id
    )
    values (
      quotation_id_value,
      line_number_value,
      btrim(line_item ->> 'description'),
      (line_item ->> 'quantity')::numeric,
      (line_item ->> 'unit_price')::numeric,
      actor_profile_id
    );
  end loop;

  update public.leads
  set status = 'qualified'
  where id = p_lead_id
    and status = 'new';

  return jsonb_build_object(
    'id', quotation_id_value,
    'quotation_number', quotation_row.quotation_number,
    'revision_number', quotation_row.revision_number,
    'status', quotation_row.status,
    'subtotal_amount', subtotal_value,
    'tax_amount', tax_amount_value,
    'quoted_amount', total_amount_value
  );
end;
$$;

create or replace function public.sales_send_quotation(p_quotation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  quotation_row public.quotations%rowtype;
  line_item_count integer;
begin
  perform private.require_sales_workspace_permission('sales.workspace.manage');

  select * into quotation_row
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Quotation draft not found';
  end if;
  if quotation_row.status <> 'draft' then
    raise exception using errcode = '23514', message = 'Only a draft Quotation may be sent';
  end if;
  if quotation_row.expires_at <= now() then
    raise exception using errcode = '23514', message = 'An expired Quotation cannot be sent';
  end if;

  select count(*) into line_item_count
  from public.quotation_line_items
  where quotation_id = quotation_row.id;
  if line_item_count < 1 then
    raise exception using errcode = '23514', message = 'A Quotation needs at least one line item before it can be sent';
  end if;

  perform 1 from public.leads where id = quotation_row.lead_id for update;

  update public.quotations
  set status = 'superseded'
  where lead_id = quotation_row.lead_id
    and status = 'sent';

  update public.quotations
  set status = 'sent'
  where id = quotation_row.id
  returning * into quotation_row;

  update public.leads
  set status = 'qualified'
  where id = quotation_row.lead_id
    and status = 'new';

  update public.leads
  set status = 'quoted'
  where id = quotation_row.lead_id
    and status = 'qualified';

  return jsonb_build_object(
    'id', quotation_row.id,
    'quotation_number', quotation_row.quotation_number,
    'revision_number', quotation_row.revision_number,
    'status', quotation_row.status,
    'sent_at', quotation_row.sent_at
  );
end;
$$;

alter table public.quotation_line_items enable row level security;
alter table public.lead_activity_logs enable row level security;
alter table public.lead_workspace_views enable row level security;

create policy rls_quotation_line_items__select__sales_workspace_reader
on public.quotation_line_items
for select
to authenticated
using ((select public.has_permission('sales.workspace.read')));

create policy rls_lead_activity_logs__select__sales_workspace_reader
on public.lead_activity_logs
for select
to authenticated
using ((select public.has_permission('sales.workspace.read')));

create policy rls_lead_workspace_views__select__own_sales_workspace_view
on public.lead_workspace_views
for select
to authenticated
using (
  (select public.has_permission('sales.workspace.read'))
  and profile_id = (select public.current_profile_id())
);

revoke all on table public.quotation_line_items from public, anon, authenticated;
revoke all on table public.lead_activity_logs from public, anon, authenticated;
revoke all on table public.lead_workspace_views from public, anon, authenticated;

grant select on table public.quotation_line_items to authenticated;
grant select on table public.lead_activity_logs to authenticated;
grant select on table public.lead_workspace_views to authenticated;
grant all on table public.quotation_line_items to service_role;
grant all on table public.lead_activity_logs to service_role;
grant all on table public.lead_workspace_views to service_role;

revoke all on function private.require_sales_workspace_permission(text)
  from public, anon, authenticated, service_role;
revoke all on function private.write_lead_activity(uuid, text, uuid, uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_lead_activity()
  from public, anon, authenticated, service_role;
revoke all on function private.record_quotation_activity()
  from public, anon, authenticated, service_role;
revoke all on function public.sales_list_lead_inbox(integer, integer, text, text, uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.sales_get_lead_detail(uuid)
  from public, anon, authenticated;
revoke all on function public.sales_mark_lead_viewed(uuid)
  from public, anon, authenticated;
revoke all on function public.sales_save_quotation(uuid, uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.sales_send_quotation(uuid)
  from public, anon, authenticated;

grant execute on function public.sales_list_lead_inbox(integer, integer, text, text, uuid, uuid, text, text)
  to authenticated;
grant execute on function public.sales_get_lead_detail(uuid)
  to authenticated;
grant execute on function public.sales_mark_lead_viewed(uuid)
  to authenticated;
grant execute on function public.sales_save_quotation(uuid, uuid, jsonb)
  to authenticated;
grant execute on function public.sales_send_quotation(uuid)
  to authenticated;

comment on table public.quotation_line_items is
  'Immutable-after-issue commercial lines owned by a Quotation. Sales command functions are the only mutation path.';
comment on table public.lead_activity_logs is
  'Append-only customer request and Quotation timeline. Application roles may read it but cannot mutate it directly.';
comment on table public.lead_workspace_views is
  'Per-staff read marker used to derive Sales Inbox unread state; it is not a customer-facing event.';
comment on column public.quotations.vat_rate is
  'Decimal VAT rate used when the Quotation was calculated. The UI default is configuration-backed; the persisted value makes issued totals auditable.';
comment on function public.sales_save_quotation(uuid, uuid, jsonb) is
  'Sales-only command boundary for validated draft Quotation creation and revision-safe draft updates.';
comment on function public.sales_send_quotation(uuid) is
  'Sales-only command boundary that issues a validated draft, supersedes prior sent revisions, and advances the Lead to quoted.';

commit;
