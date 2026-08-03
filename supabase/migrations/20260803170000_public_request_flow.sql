begin;

drop policy rls_addresses__insert__guest_submission on public.addresses;
drop policy rls_leads__insert__guest_submission on public.leads;

revoke insert on table public.addresses from anon;
revoke insert on table public.leads from anon;

alter table public.leads
  add column cargo_description text,
  add column cargo_quantity integer,
  add column submission_key uuid,
  add column privacy_consent_version text,
  add column privacy_consented_at timestamp with time zone;

alter table public.leads
  add constraint ck_leads__cargo_description
    check (
      cargo_description is null
      or char_length(btrim(cargo_description)) between 5 and 2000
    ),
  add constraint ck_leads__cargo_quantity
    check (cargo_quantity is null or cargo_quantity between 1 and 100000),
  add constraint ck_leads__public_request_consent
    check (
      (
        submission_key is null
        and privacy_consent_version is null
        and privacy_consented_at is null
      )
      or (
        submission_key is not null
        and char_length(btrim(privacy_consent_version)) between 3 and 100
        and privacy_consented_at is not null
      )
    );

create unique index uidx_leads__submission_key
  on public.leads (submission_key)
  where submission_key is not null;

create or replace function private.protect_public_request_provenance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and auth.role() = 'anon' then
    new.submission_key := null;
    new.privacy_consent_version := null;
    new.privacy_consented_at := null;
  end if;

  if tg_op = 'UPDATE' and (
    new.submission_key is distinct from old.submission_key
    or new.privacy_consent_version is distinct from old.privacy_consent_version
    or new.privacy_consented_at is distinct from old.privacy_consented_at
  ) then
    raise exception using
      errcode = '23514',
      message = 'Public request submission and consent provenance are immutable';
  end if;

  return new;
end;
$$;

create trigger trg_leads__before_insert_update__protect_request_provenance
before insert or update on public.leads
for each row execute function private.protect_public_request_provenance();

create or replace function public.submit_guest_service_request(
  request_payload jsonb,
  attachment_payload jsonb default '[]'::jsonb
)
returns table (lead_id uuid, reference_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_lead_id uuid;
  created_reference_number text;
  delivery_address_id uuid;
  pickup_address_id uuid;
  request_submission_key uuid;
  selected_option_ids uuid[];
begin
  if auth.role() is distinct from 'service_role' then
    raise exception using errcode = '42501', message = 'Service role is required';
  end if;

  if jsonb_typeof(request_payload) <> 'object'
    or jsonb_typeof(attachment_payload) <> 'array'
  then
    raise exception using errcode = '22023', message = 'Invalid public request payload';
  end if;

  request_submission_key := (request_payload ->> 'submission_id')::uuid;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(request_submission_key::text, 0)
  );

  select leads.id, leads.reference_number
  into created_lead_id, created_reference_number
  from public.leads
  where leads.submission_key = request_submission_key;

  if created_lead_id is not null then
    return query select created_lead_id, created_reference_number;
    return;
  end if;

  if jsonb_array_length(attachment_payload) > 4
    or exists (
      select 1
      from jsonb_array_elements(attachment_payload) as attachment
      where attachment ->> 'storage_path'
        not like 'guest/' || request_submission_key::text || '/%'
    )
  then
    raise exception using errcode = '22023', message = 'Invalid attachment payload';
  end if;

  select coalesce(array_agg(option_id), '{}'::uuid[])
  into selected_option_ids
  from (
    select value::uuid as option_id
    from jsonb_array_elements_text(
      coalesce(request_payload -> 'selected_option_ids', '[]'::jsonb)
    )
  ) as selected_options;

  insert into public.addresses (
    city_id,
    formatted_address,
    latitude,
    longitude,
    location_provider,
    location_precision
  )
  values (
    (request_payload #>> '{pickup,city_id}')::uuid,
    request_payload #>> '{pickup,formatted_address}',
    (request_payload #>> '{pickup,latitude}')::numeric,
    (request_payload #>> '{pickup,longitude}')::numeric,
    'manual',
    case
      when request_payload #>> '{pickup,latitude}' is not null then 'exact'
      else null
    end
  )
  returning id into pickup_address_id;

  insert into public.addresses (
    city_id,
    formatted_address,
    latitude,
    longitude,
    location_provider,
    location_precision
  )
  values (
    (request_payload #>> '{delivery,city_id}')::uuid,
    request_payload #>> '{delivery,formatted_address}',
    (request_payload #>> '{delivery,latitude}')::numeric,
    (request_payload #>> '{delivery,longitude}')::numeric,
    'manual',
    case
      when request_payload #>> '{delivery,latitude}' is not null then 'exact'
      else null
    end
  )
  returning id into delivery_address_id;

  insert into public.leads (
    profile_id,
    customer_name,
    mobile_number,
    email,
    preferred_locale,
    source,
    service_id,
    requested_service_option_ids,
    pickup_address_id,
    delivery_address_id,
    cargo_description,
    cargo_quantity,
    customer_notes,
    internal_notes,
    status,
    submission_key,
    privacy_consent_version,
    privacy_consented_at
  )
  values (
    null,
    request_payload #>> '{contact,full_name}',
    request_payload #>> '{contact,mobile}',
    nullif(request_payload #>> '{contact,email}', ''),
    request_payload ->> 'locale',
    'web',
    (request_payload ->> 'service_id')::uuid,
    selected_option_ids,
    pickup_address_id,
    delivery_address_id,
    request_payload ->> 'cargo_description',
    (request_payload ->> 'quantity')::integer,
    nullif(request_payload #>> '{contact,notes}', ''),
    null,
    'new',
    request_submission_key,
    request_payload ->> 'privacy_consent_version',
    now()
  )
  returning id, public.leads.reference_number
  into created_lead_id, created_reference_number;

  insert into public.lead_attachments (
    lead_id,
    storage_bucket,
    storage_path,
    original_filename,
    mime_type,
    size_bytes,
    checksum_sha256,
    status,
    uploaded_at
  )
  select
    created_lead_id,
    'attachments',
    attachment ->> 'storage_path',
    attachment ->> 'original_filename',
    attachment ->> 'mime_type',
    (attachment ->> 'size_bytes')::bigint,
    attachment ->> 'checksum_sha256',
    'pending',
    now()
  from jsonb_array_elements(attachment_payload) as attachment;

  return query select created_lead_id, created_reference_number;
end;
$$;

revoke all on function private.protect_public_request_provenance()
  from public, anon, authenticated;
revoke all on function public.submit_guest_service_request(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_guest_service_request(jsonb, jsonb)
  to service_role;

comment on column public.leads.cargo_description is
  'Customer-provided cargo description captured during public request intake.';
comment on column public.leads.cargo_quantity is
  'Optional approximate whole-item quantity supplied by the requester.';
comment on column public.leads.submission_key is
  'Opaque immutable idempotency key for the public request flow; not a tracking credential.';
comment on column public.leads.privacy_consent_version is
  'Immutable version of the public request privacy notice accepted at submission.';
comment on column public.leads.privacy_consented_at is
  'Authoritative server time when the public request privacy notice was accepted.';
comment on function public.submit_guest_service_request(jsonb, jsonb) is
  'Service-role-only transactional boundary for guest Addresses, Lead, and verified attachment metadata.';

commit;
