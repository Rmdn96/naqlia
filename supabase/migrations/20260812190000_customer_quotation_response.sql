begin;

-- Customer response tokens are capability credentials. Only their SHA-256
-- digests are persisted; plaintext is returned once by staff issuance RPCs.
alter table public.quotations
  add column rejected_at timestamp with time zone,
  add column rejection_reason_code text,
  add column rejection_reason_text text,
  add column superseded_by_quotation_id uuid,
  add constraint fk_quotations__superseded_by_quotation_id__quotations
    foreign key (superseded_by_quotation_id) references public.quotations (id) on delete restrict,
  add constraint ck_quotations__rejection_reason_code
    check (
      rejection_reason_code is null
      or rejection_reason_code in ('price', 'timing', 'changed_requirements', 'no_longer_needed', 'other')
    ),
  add constraint ck_quotations__rejection_reason_text
    check (
      rejection_reason_text is null
      or char_length(btrim(rejection_reason_text)) between 2 and 500
    );

-- Preserve historical issued revisions by linking each previously superseded
-- row to the next recorded revision. New transitions always set this link.
update public.quotations old_quotation
set superseded_by_quotation_id = (
  select candidate.id
  from public.quotations candidate
  where candidate.lead_id = old_quotation.lead_id
    and candidate.revision_number > old_quotation.revision_number
  order by candidate.revision_number
  limit 1
)
where old_quotation.status = 'superseded';

alter table public.quotations
  add constraint ck_quotations__rejected_state
    check (
      (status = 'rejected' and rejected_at is not null)
      or (status <> 'rejected' and rejected_at is null and rejection_reason_code is null and rejection_reason_text is null)
    ),
  add constraint ck_quotations__superseded_state
    check (
      (status = 'superseded' and superseded_by_quotation_id is not null)
      or (status <> 'superseded' and superseded_by_quotation_id is null)
    );

alter table public.quotations drop constraint ck_quotations__approved_state;
alter table public.quotations
  add constraint ck_quotations__approved_state
    check (
      (status = 'approved' and approved_at is not null)
      or (status <> 'approved' and approved_at is null and approved_by_profile_id is null)
    );

create index idx_quotations__superseded_by_quotation_id
  on public.quotations (superseded_by_quotation_id)
  where superseded_by_quotation_id is not null;

create table public.quotation_customer_accesses (
  id uuid not null default gen_random_uuid(),
  quotation_id uuid not null,
  token_hash bytea not null,
  status text not null default 'active',
  issued_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null,
  first_viewed_at timestamp with time zone,
  last_viewed_at timestamp with time zone,
  responded_at timestamp with time zone,
  revoked_at timestamp with time zone,
  revocation_reason text,
  created_by_profile_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pk_quotation_customer_accesses primary key (id),
  constraint uq_quotation_customer_accesses__token_hash unique (token_hash),
  constraint fk_quotation_customer_accesses__quotation_id__quotations
    foreign key (quotation_id) references public.quotations (id) on delete restrict,
  constraint fk_quotation_customer_accesses__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_quotation_customer_accesses__token_hash_length
    check (octet_length(token_hash) = 32),
  constraint ck_quotation_customer_accesses__status
    check (status in ('active', 'responded', 'revoked')),
  constraint ck_quotation_customer_accesses__expiry
    check (expires_at > issued_at),
  constraint ck_quotation_customer_accesses__view_state
    check (
      (first_viewed_at is null and last_viewed_at is null)
      or (first_viewed_at is not null and last_viewed_at is not null and last_viewed_at >= first_viewed_at)
    ),
  constraint ck_quotation_customer_accesses__terminal_state
    check (
      (status = 'active' and responded_at is null and revoked_at is null and revocation_reason is null)
      or (status = 'responded' and responded_at is not null and revoked_at is null and revocation_reason is null)
      or (
        status = 'revoked'
        and responded_at is null
        and revoked_at is not null
        and revocation_reason in ('expired', 'reissued', 'superseded', 'manual')
      )
    )
);

create unique index uq_quotation_customer_accesses__active_quotation
  on public.quotation_customer_accesses (quotation_id)
  where status = 'active';
create index idx_quotation_customer_accesses__quotation_id_issued_at
  on public.quotation_customer_accesses (quotation_id, issued_at desc);
create index idx_quotation_customer_accesses__expires_at
  on public.quotation_customer_accesses (expires_at)
  where status = 'active';

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs
  add constraint ck_lead_activity_logs__event_key check (
    event_key in (
      'lead_created', 'lead_viewed', 'lead_qualified', 'lead_quoted', 'lead_order_ready',
      'lead_closed', 'lead_cancelled', 'quotation_draft_created', 'quotation_draft_updated',
      'quotation_sent', 'quotation_approved', 'quotation_rejected', 'quotation_expired',
      'quotation_superseded', 'quotation_cancelled', 'customer_quotation_access_issued',
      'customer_quotation_viewed', 'customer_accepted_quotation',
      'customer_rejected_quotation', 'order_created_from_quotation',
      'customer_access_revoked'
    )
  );

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

    if old.status <> 'draft' and (
      new.currency <> old.currency
      or new.subtotal_amount <> old.subtotal_amount
      or new.tax_amount <> old.tax_amount
      or new.quoted_amount <> old.quoted_amount
      or new.vat_rate <> old.vat_rate
      or new.expires_at <> old.expires_at
      or new.customer_notes is distinct from old.customer_notes
      or new.terms_ar <> old.terms_ar
      or new.terms_en <> old.terms_en
    ) then
      raise exception using errcode = '23514', message = 'Issued Quotation customer terms are immutable';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'draft' and new.status in ('sent', 'cancelled'))
      or (old.status = 'sent' and new.status in ('approved', 'rejected', 'expired', 'superseded'))
    ) then
      raise exception using errcode = '23514', message = 'Unsupported Quotation status transition';
    end if;
  end if;

  if new.status not in ('draft', 'cancelled') and new.sent_at is null then
    new.sent_at := now();
  end if;

  if new.status = 'approved' then
    if tg_op = 'INSERT' or old.status <> 'approved' then
      if auth.role() = 'authenticated' and not public.has_permission('quotation.record.approve') then
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

  if new.status = 'rejected' then
    if tg_op = 'INSERT' or old.status <> 'rejected' then
      new.rejected_at := now();
    end if;
  else
    new.rejected_at := null;
    new.rejection_reason_code := null;
    new.rejection_reason_text := null;
  end if;

  if new.status <> 'superseded' then
    new.superseded_by_quotation_id := null;
  elsif new.superseded_by_quotation_id is null or new.superseded_by_quotation_id = new.id then
    raise exception using errcode = '23514', message = 'Superseded Quotations require a distinct replacement';
  end if;

  return new;
end;
$$;

create or replace function private.issue_quotation_customer_access(
  p_quotation_id uuid,
  p_actor_profile_id uuid
)
returns table (access_id uuid, plaintext_token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  quotation_row public.quotations%rowtype;
  token_value text;
begin
  select * into quotation_row
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found or quotation_row.status <> 'sent' or quotation_row.expires_at <= now() then
    raise exception using errcode = '23514', message = 'Customer access requires an active sent Quotation';
  end if;

  token_value := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.quotation_customer_accesses (
    quotation_id, token_hash, expires_at, created_by_profile_id
  ) values (
    quotation_row.id,
    extensions.digest(token_value, 'sha256'),
    quotation_row.expires_at,
    p_actor_profile_id
  ) returning id into access_id;

  perform private.write_lead_activity(
    quotation_row.lead_id,
    'customer_quotation_access_issued',
    p_actor_profile_id,
    quotation_row.id,
    jsonb_build_object('revision_number', quotation_row.revision_number)
  );

  plaintext_token := token_value;
  return next;
end;
$$;

create or replace function private.revoke_quotation_customer_accesses(
  p_quotation_id uuid,
  p_reason text,
  p_actor_profile_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  revoked_count integer;
  quotation_row public.quotations%rowtype;
begin
  if p_reason not in ('expired', 'reissued', 'superseded', 'manual') then
    raise exception using errcode = '22023', message = 'Unsupported customer access revocation reason';
  end if;

  update public.quotation_customer_accesses
  set status = 'revoked', revoked_at = now(), revocation_reason = p_reason, updated_at = now()
  where quotation_id = p_quotation_id and status = 'active';
  get diagnostics revoked_count = row_count;

  if revoked_count > 0 then
    select * into quotation_row from public.quotations where id = p_quotation_id;
    perform private.write_lead_activity(
      quotation_row.lead_id,
      'customer_access_revoked',
      p_actor_profile_id,
      quotation_row.id,
      jsonb_build_object('reason', p_reason, 'revision_number', quotation_row.revision_number)
    );
  end if;

  return revoked_count;
end;
$$;

create or replace function public.sales_send_quotation(p_quotation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  quotation_row public.quotations%rowtype;
  prior_row record;
  line_item_count integer;
  access_record record;
begin
  actor_profile_id := private.require_sales_workspace_permission('sales.workspace.manage');

  select * into quotation_row from public.quotations where id = p_quotation_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Quotation draft not found'; end if;
  if quotation_row.status <> 'draft' then
    raise exception using errcode = '23514', message = 'Only a draft Quotation may be sent';
  end if;
  if quotation_row.expires_at <= now() then
    raise exception using errcode = '23514', message = 'An expired Quotation cannot be sent';
  end if;

  select count(*) into line_item_count from public.quotation_line_items where quotation_id = quotation_row.id;
  if line_item_count < 1 then
    raise exception using errcode = '23514', message = 'A Quotation needs at least one line item before it can be sent';
  end if;

  perform 1 from public.leads where id = quotation_row.lead_id for update;

  for prior_row in
    select id from public.quotations
    where lead_id = quotation_row.lead_id and status = 'sent'
    for update
  loop
    perform private.revoke_quotation_customer_accesses(prior_row.id, 'superseded', actor_profile_id);
    update public.quotations
    set status = 'superseded', superseded_by_quotation_id = quotation_row.id
    where id = prior_row.id;
  end loop;

  update public.quotations set status = 'sent' where id = quotation_row.id returning * into quotation_row;
  update public.leads set status = 'qualified' where id = quotation_row.lead_id and status = 'new';
  update public.leads set status = 'quoted' where id = quotation_row.lead_id and status = 'qualified';

  select * into access_record
  from private.issue_quotation_customer_access(quotation_row.id, actor_profile_id);

  return jsonb_build_object(
    'id', quotation_row.id,
    'quotation_number', quotation_row.quotation_number,
    'revision_number', quotation_row.revision_number,
    'status', quotation_row.status,
    'sent_at', quotation_row.sent_at,
    'customer_access_token', access_record.plaintext_token
  );
end;
$$;

create or replace function public.sales_reissue_quotation_access(p_quotation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  quotation_row public.quotations%rowtype;
  access_record record;
begin
  actor_profile_id := private.require_sales_workspace_permission('sales.workspace.manage');
  select * into quotation_row from public.quotations where id = p_quotation_id for update;

  if not found then raise exception using errcode = 'P0002', message = 'Quotation not found'; end if;
  if quotation_row.status <> 'sent' or quotation_row.expires_at <= now() then
    raise exception using errcode = '23514', message = 'Only an active sent Quotation may be reissued';
  end if;

  perform private.revoke_quotation_customer_accesses(quotation_row.id, 'reissued', actor_profile_id);
  select * into access_record
  from private.issue_quotation_customer_access(quotation_row.id, actor_profile_id);

  return jsonb_build_object(
    'id', quotation_row.id,
    'quotation_number', quotation_row.quotation_number,
    'revision_number', quotation_row.revision_number,
    'customer_access_token', access_record.plaintext_token
  );
end;
$$;

create or replace function private.customer_quotation_payload(
  p_quotation_id uuid,
  p_state text
)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'state', p_state,
    'lead', jsonb_build_object(
      'reference_number', leads.reference_number,
      'customer_name', leads.customer_name,
      'preferred_locale', leads.preferred_locale,
      'service', jsonb_build_object('name_ar', services.name_ar, 'name_en', services.name_en),
      'pickup', jsonb_build_object(
        'formatted_address', pickup.formatted_address,
        'city_name_ar', pickup_city.name_ar,
        'city_name_en', pickup_city.name_en
      ),
      'delivery', jsonb_build_object(
        'formatted_address', delivery.formatted_address,
        'city_name_ar', delivery_city.name_ar,
        'city_name_en', delivery_city.name_en
      )
    ),
    'quotation', jsonb_build_object(
      'quotation_number', quotations.quotation_number,
      'revision_number', quotations.revision_number,
      'status', quotations.status,
      'created_at', quotations.created_at,
      'sent_at', quotations.sent_at,
      'expires_at', quotations.expires_at,
      'accepted_at', quotations.approved_at,
      'rejected_at', quotations.rejected_at,
      'currency', quotations.currency,
      'subtotal_amount', quotations.subtotal_amount,
      'tax_amount', quotations.tax_amount,
      'quoted_amount', quotations.quoted_amount,
      'vat_rate', quotations.vat_rate,
      'customer_notes', quotations.customer_notes,
      'terms_ar', quotations.terms_ar,
      'terms_en', quotations.terms_en,
      'line_items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'line_number', items.line_number,
          'description', items.description,
          'quantity', items.quantity,
          'unit_price', items.unit_price,
          'line_total_amount', items.line_total_amount
        ) order by items.line_number)
        from public.quotation_line_items items
        where items.quotation_id = quotations.id
      ), '[]'::jsonb)
    ),
    'order_number', orders.order_number
  )
  from public.quotations
  join public.leads on leads.id = quotations.lead_id
  join public.services on services.id = leads.service_id
  join public.addresses pickup on pickup.id = leads.pickup_address_id
  join public.cities pickup_city on pickup_city.id = pickup.city_id
  join public.addresses delivery on delivery.id = leads.delivery_address_id
  join public.cities delivery_city on delivery_city.id = delivery.city_id
  left join public.orders on orders.quotation_id = quotations.id
  where quotations.id = p_quotation_id;
$$;

create or replace function public.customer_get_quotation(p_access_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_row public.quotation_customer_accesses%rowtype;
  quotation_row public.quotations%rowtype;
  first_view boolean := false;
  state_value text;
begin
  if p_access_token is null or p_access_token !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('state', 'invalid');
  end if;

  select * into access_row
  from public.quotation_customer_accesses
  where token_hash = extensions.digest(p_access_token, 'sha256')
  for update;

  if not found then return jsonb_build_object('state', 'invalid'); end if;

  select * into quotation_row from public.quotations where id = access_row.quotation_id for update;

  if access_row.status = 'revoked' then
    if access_row.revocation_reason = 'superseded' then
      return private.customer_quotation_payload(quotation_row.id, 'superseded');
    end if;
    return jsonb_build_object('state', 'invalid');
  end if;

  if quotation_row.status = 'sent' and (quotation_row.expires_at <= now() or access_row.expires_at <= now()) then
    update public.quotations set status = 'expired' where id = quotation_row.id;
    perform private.revoke_quotation_customer_accesses(quotation_row.id, 'expired', null);
    state_value := 'expired';
  else
    state_value := case quotation_row.status
      when 'sent' then 'active'
      when 'approved' then 'accepted'
      when 'rejected' then 'rejected'
      when 'expired' then 'expired'
      when 'superseded' then 'superseded'
      else 'invalid'
    end;
  end if;

  if state_value <> 'invalid' then
    update public.quotation_customer_accesses
    set
      first_viewed_at = coalesce(first_viewed_at, now()),
      last_viewed_at = now(),
      updated_at = now()
    where id = access_row.id
    returning first_viewed_at = last_viewed_at into first_view;

    if first_view then
      perform private.write_lead_activity(
        quotation_row.lead_id,
        'customer_quotation_viewed',
        null,
        quotation_row.id,
        jsonb_build_object('revision_number', quotation_row.revision_number)
      );
    end if;
  end if;

  if state_value = 'invalid' then return jsonb_build_object('state', 'invalid'); end if;
  return private.customer_quotation_payload(quotation_row.id, state_value);
end;
$$;

create or replace function public.customer_respond_to_quotation(
  p_access_token text,
  p_response text,
  p_reason_code text default null,
  p_reason_text text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_row public.quotation_customer_accesses%rowtype;
  quotation_row public.quotations%rowtype;
  lead_row public.leads%rowtype;
  order_row public.orders%rowtype;
  clean_reason_text text := nullif(btrim(p_reason_text), '');
begin
  if p_access_token is null or p_access_token !~ '^[a-f0-9]{64}$'
    or p_response not in ('accept', 'reject')
  then
    return jsonb_build_object('state', 'invalid');
  end if;
  if p_reason_code is not null
    and p_reason_code not in ('price', 'timing', 'changed_requirements', 'no_longer_needed', 'other')
  then
    raise exception using errcode = '22023', message = 'Unsupported rejection reason';
  end if;
  if clean_reason_text is not null and char_length(clean_reason_text) not between 2 and 500 then
    raise exception using errcode = '22023', message = 'Rejection reason text must contain 2 to 500 characters';
  end if;

  select * into access_row
  from public.quotation_customer_accesses
  where token_hash = extensions.digest(p_access_token, 'sha256')
  for update;
  if not found then return jsonb_build_object('state', 'invalid'); end if;

  select * into quotation_row from public.quotations where id = access_row.quotation_id for update;
  select * into lead_row from public.leads where id = quotation_row.lead_id for update;

  if quotation_row.status = 'approved' then
    select * into order_row from public.orders where quotation_id = quotation_row.id;
    return jsonb_build_object('state', 'accepted', 'order_number', order_row.order_number, 'responded_at', quotation_row.approved_at);
  end if;
  if quotation_row.status = 'rejected' then
    return jsonb_build_object('state', 'rejected', 'responded_at', quotation_row.rejected_at);
  end if;
  if access_row.status <> 'active' then
    return case when access_row.revocation_reason = 'superseded'
      then jsonb_build_object('state', 'superseded')
      else jsonb_build_object('state', 'invalid') end;
  end if;
  if quotation_row.status = 'superseded' then
    perform private.revoke_quotation_customer_accesses(quotation_row.id, 'superseded', null);
    return jsonb_build_object('state', 'superseded');
  end if;
  if quotation_row.status <> 'sent' then
    return jsonb_build_object('state', case when quotation_row.status = 'expired' then 'expired' else 'invalid' end);
  end if;
  if quotation_row.expires_at <= now() or access_row.expires_at <= now() then
    update public.quotations set status = 'expired' where id = quotation_row.id;
    perform private.revoke_quotation_customer_accesses(quotation_row.id, 'expired', null);
    return jsonb_build_object('state', 'expired');
  end if;

  if p_response = 'reject' then
    update public.quotations
    set status = 'rejected', rejection_reason_code = p_reason_code, rejection_reason_text = clean_reason_text
    where id = quotation_row.id
    returning * into quotation_row;

    update public.quotation_customer_accesses
    set status = 'responded', responded_at = quotation_row.rejected_at, updated_at = now()
    where id = access_row.id;

    perform private.write_lead_activity(
      quotation_row.lead_id, 'customer_rejected_quotation', null, quotation_row.id,
      jsonb_build_object('revision_number', quotation_row.revision_number, 'reason_code', p_reason_code)
    );
    return jsonb_build_object('state', 'rejected', 'responded_at', quotation_row.rejected_at);
  end if;

  update public.quotations set status = 'approved' where id = quotation_row.id returning * into quotation_row;

  insert into public.orders (
    quotation_id, tracking_mobile_number, currency, subtotal_amount, tax_amount, total_amount
  ) values (
    quotation_row.id, lead_row.mobile_number, quotation_row.currency,
    quotation_row.subtotal_amount, quotation_row.tax_amount, quotation_row.quoted_amount
  )
  on conflict (quotation_id) do nothing
  returning * into order_row;

  if order_row.id is null then
    select * into order_row from public.orders where quotation_id = quotation_row.id;
  end if;

  update public.quotation_customer_accesses
  set status = 'responded', responded_at = quotation_row.approved_at, updated_at = now()
  where id = access_row.id;

  perform private.write_lead_activity(
    quotation_row.lead_id, 'customer_accepted_quotation', null, quotation_row.id,
    jsonb_build_object('revision_number', quotation_row.revision_number)
  );
  perform private.write_lead_activity(
    quotation_row.lead_id, 'order_created_from_quotation', null, quotation_row.id,
    jsonb_build_object('order_number', order_row.order_number, 'revision_number', quotation_row.revision_number)
  );

  return jsonb_build_object(
    'state', 'accepted',
    'order_number', order_row.order_number,
    'responded_at', quotation_row.approved_at
  );
end;
$$;

alter table public.quotation_customer_accesses enable row level security;
revoke all on table public.quotation_customer_accesses from public, anon, authenticated;
grant all on table public.quotation_customer_accesses to service_role;

revoke all on function private.issue_quotation_customer_access(uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function private.revoke_quotation_customer_accesses(uuid, text, uuid) from public, anon, authenticated, service_role;
revoke all on function private.customer_quotation_payload(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.sales_reissue_quotation_access(uuid) from public, anon, authenticated;
revoke all on function public.customer_get_quotation(text) from public, anon, authenticated;
revoke all on function public.customer_respond_to_quotation(text, text, text, text) from public, anon, authenticated;

grant execute on function public.sales_reissue_quotation_access(uuid) to authenticated;
grant execute on function public.customer_get_quotation(text) to anon, authenticated;
grant execute on function public.customer_respond_to_quotation(text, text, text, text) to anon, authenticated;

comment on table public.quotation_customer_accesses is
  'Hashed, quotation-scoped guest capabilities. Plaintext tokens are returned once and never persisted.';
comment on column public.quotation_customer_accesses.token_hash is
  'SHA-256 digest of a 256-bit random hexadecimal capability token.';
comment on function public.customer_get_quotation(text) is
  'Narrow anonymous read boundary returning only customer-safe fields for one valid quotation capability.';
comment on function public.customer_respond_to_quotation(text, text, text, text) is
  'Transactional, idempotent guest response boundary; acceptance creates at most one Order.';
comment on function public.sales_reissue_quotation_access(uuid) is
  'Sales-only token rotation boundary. Revokes prior access and returns the replacement token once.';

commit;
