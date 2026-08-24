begin;

create table public.cities (
  id uuid not null default gen_random_uuid(),
  city_code text not null,
  slug text not null,
  name_ar text not null,
  name_en text not null,
  region_ar text not null,
  region_en text not null,
  country_code text not null default 'SA',
  status text not null default 'active',
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  deleted_at timestamp with time zone,
  deleted_by_profile_id uuid,
  deletion_reason text,
  constraint pk_cities primary key (id),
  constraint uq_cities__city_code unique (city_code),
  constraint uq_cities__slug unique (slug),
  constraint fk_cities__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_cities__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_cities__deleted_by_profile_id__profiles
    foreign key (deleted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_cities__city_code
    check (city_code ~ '^[A-Z][A-Z0-9_]{1,19}$'),
  constraint ck_cities__slug
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint ck_cities__localized_names
    check (
      char_length(btrim(name_ar)) between 2 and 100
      and char_length(btrim(name_en)) between 2 and 100
    ),
  constraint ck_cities__localized_regions
    check (
      char_length(btrim(region_ar)) between 2 and 100
      and char_length(btrim(region_en)) between 2 and 100
    ),
  constraint ck_cities__country_code check (country_code = 'SA'),
  constraint ck_cities__status check (status in ('active', 'inactive')),
  constraint ck_cities__display_order_nonnegative check (display_order >= 0),
  constraint ck_cities__deletion_state
    check (
      (
        deleted_at is null
        and deleted_by_profile_id is null
        and deletion_reason is null
      )
      or (
        deleted_at is not null
        and char_length(btrim(deletion_reason)) between 8 and 500
      )
    )
);

create table public.services (
  id uuid not null default gen_random_uuid(),
  service_key text not null,
  name_ar text not null,
  name_en text not null,
  description_ar text not null,
  description_en text not null,
  transport_scope text not null,
  status text not null default 'active',
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  deleted_at timestamp with time zone,
  deleted_by_profile_id uuid,
  deletion_reason text,
  constraint pk_services primary key (id),
  constraint uq_services__service_key unique (service_key),
  constraint fk_services__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_services__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_services__deleted_by_profile_id__profiles
    foreign key (deleted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_services__service_key
    check (service_key ~ '^[a-z][a-z0-9_]{2,49}$'),
  constraint ck_services__localized_names
    check (
      char_length(btrim(name_ar)) between 2 and 120
      and char_length(btrim(name_en)) between 2 and 120
    ),
  constraint ck_services__localized_descriptions
    check (
      char_length(btrim(description_ar)) between 8 and 1000
      and char_length(btrim(description_en)) between 8 and 1000
    ),
  constraint ck_services__transport_scope
    check (transport_scope in ('local', 'intercity', 'both')),
  constraint ck_services__status check (status in ('active', 'inactive')),
  constraint ck_services__display_order_nonnegative check (display_order >= 0),
  constraint ck_services__deletion_state
    check (
      (
        deleted_at is null
        and deleted_by_profile_id is null
        and deletion_reason is null
      )
      or (
        deleted_at is not null
        and char_length(btrim(deletion_reason)) between 8 and 500
      )
    )
);

create table public.service_options (
  id uuid not null default gen_random_uuid(),
  service_id uuid,
  option_key text not null,
  name_ar text not null,
  name_en text not null,
  description_ar text not null,
  description_en text not null,
  status text not null default 'active',
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  deleted_at timestamp with time zone,
  deleted_by_profile_id uuid,
  deletion_reason text,
  constraint pk_service_options primary key (id),
  constraint fk_service_options__service_id__services
    foreign key (service_id) references public.services (id) on delete restrict,
  constraint fk_service_options__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_service_options__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_service_options__deleted_by_profile_id__profiles
    foreign key (deleted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_service_options__option_key
    check (option_key ~ '^[a-z][a-z0-9_]{2,49}$'),
  constraint ck_service_options__localized_names
    check (
      char_length(btrim(name_ar)) between 2 and 120
      and char_length(btrim(name_en)) between 2 and 120
    ),
  constraint ck_service_options__localized_descriptions
    check (
      char_length(btrim(description_ar)) between 8 and 1000
      and char_length(btrim(description_en)) between 8 and 1000
    ),
  constraint ck_service_options__status check (status in ('active', 'inactive')),
  constraint ck_service_options__display_order_nonnegative check (display_order >= 0),
  constraint ck_service_options__deletion_state
    check (
      (
        deleted_at is null
        and deleted_by_profile_id is null
        and deletion_reason is null
      )
      or (
        deleted_at is not null
        and char_length(btrim(deletion_reason)) between 8 and 500
      )
    )
);

create table public.addresses (
  id uuid not null default gen_random_uuid(),
  profile_id uuid,
  city_id uuid not null,
  formatted_address text not null,
  district text,
  street_name text,
  building_number text,
  unit_number text,
  postal_code text,
  landmark text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  location_provider text not null default 'manual',
  provider_place_id text,
  location_precision text,
  route_access_notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  deleted_at timestamp with time zone,
  deleted_by_profile_id uuid,
  deletion_reason text,
  constraint pk_addresses primary key (id),
  constraint fk_addresses__profile_id__profiles
    foreign key (profile_id) references public.profiles (id) on delete restrict,
  constraint fk_addresses__city_id__cities
    foreign key (city_id) references public.cities (id) on delete restrict,
  constraint fk_addresses__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_addresses__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_addresses__deleted_by_profile_id__profiles
    foreign key (deleted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_addresses__formatted_address
    check (char_length(btrim(formatted_address)) between 8 and 500),
  constraint ck_addresses__district
    check (district is null or char_length(btrim(district)) between 2 and 120),
  constraint ck_addresses__coordinates
    check (
      (latitude is null and longitude is null)
      or (
        latitude between -90 and 90
        and longitude between -180 and 180
      )
    ),
  constraint ck_addresses__location_provider
    check (location_provider in ('manual', 'google_maps', 'geocoded')),
  constraint ck_addresses__provider_place_id
    check (
      provider_place_id is null
      or char_length(btrim(provider_place_id)) between 3 and 255
    ),
  constraint ck_addresses__location_precision
    check (
      location_precision is null
      or location_precision in ('exact', 'approximate', 'city_center')
    ),
  constraint ck_addresses__postal_code
    check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  constraint ck_addresses__route_access_notes
    check (
      route_access_notes is null
      or char_length(btrim(route_access_notes)) between 2 and 1000
    ),
  constraint ck_addresses__deletion_state
    check (
      (
        deleted_at is null
        and deleted_by_profile_id is null
        and deletion_reason is null
      )
      or (
        deleted_at is not null
        and char_length(btrim(deletion_reason)) between 8 and 500
      )
    )
);

create table public.leads (
  id uuid not null default gen_random_uuid(),
  reference_number text not null default (
    'LD-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  profile_id uuid,
  customer_name text not null,
  mobile_number text not null,
  email text,
  preferred_locale text not null default 'ar',
  source text not null default 'web',
  service_id uuid not null,
  requested_service_option_ids uuid[] not null default '{}',
  service_snapshot jsonb not null default '{}'::jsonb,
  service_options_snapshot jsonb not null default '[]'::jsonb,
  pickup_address_id uuid not null,
  delivery_address_id uuid not null,
  customer_notes text,
  internal_notes text,
  status text not null default 'new',
  submitted_at timestamp with time zone not null default now(),
  qualified_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  constraint pk_leads primary key (id),
  constraint uq_leads__reference_number unique (reference_number),
  constraint fk_leads__profile_id__profiles
    foreign key (profile_id) references public.profiles (id) on delete restrict,
  constraint fk_leads__service_id__services
    foreign key (service_id) references public.services (id) on delete restrict,
  constraint fk_leads__pickup_address_id__addresses
    foreign key (pickup_address_id) references public.addresses (id) on delete restrict,
  constraint fk_leads__delivery_address_id__addresses
    foreign key (delivery_address_id) references public.addresses (id) on delete restrict,
  constraint fk_leads__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_leads__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_leads__reference_number
    check (reference_number ~ '^LD-[0-9]{8}-[A-F0-9]{10}$'),
  constraint ck_leads__customer_name
    check (char_length(btrim(customer_name)) between 2 and 150),
  constraint ck_leads__mobile_number
    check (mobile_number ~ '^\+9665[0-9]{8}$'),
  constraint ck_leads__email
    check (
      email is null
      or (
        char_length(email) <= 254
        and email = lower(btrim(email))
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    ),
  constraint ck_leads__preferred_locale check (preferred_locale in ('ar', 'en')),
  constraint ck_leads__source check (source in ('web', 'phone', 'admin')),
  constraint ck_leads__requested_options
    check (
      array_position(requested_service_option_ids, null) is null
      and cardinality(requested_service_option_ids) <= 10
    ),
  constraint ck_leads__service_snapshot check (jsonb_typeof(service_snapshot) = 'object'),
  constraint ck_leads__options_snapshot
    check (jsonb_typeof(service_options_snapshot) = 'array'),
  constraint ck_leads__distinct_addresses check (pickup_address_id <> delivery_address_id),
  constraint ck_leads__customer_notes
    check (
      customer_notes is null
      or char_length(btrim(customer_notes)) between 2 and 3000
    ),
  constraint ck_leads__internal_notes
    check (
      internal_notes is null
      or char_length(btrim(internal_notes)) between 2 and 5000
    ),
  constraint ck_leads__status
    check (status in ('new', 'qualified', 'quoted', 'converted', 'closed', 'cancelled')),
  constraint ck_leads__lifecycle_dates
    check (
      (status <> 'qualified' or qualified_at is not null)
      and (status not in ('closed', 'cancelled') or closed_at is not null)
      and (qualified_at is null or qualified_at >= submitted_at)
      and (closed_at is null or closed_at >= submitted_at)
    )
);

create table public.lead_attachments (
  id uuid not null default gen_random_uuid(),
  owner_entity_type text not null default 'lead',
  lead_id uuid not null,
  storage_bucket text not null default 'attachments',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  checksum_sha256 text,
  status text not null default 'pending',
  uploaded_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  deleted_at timestamp with time zone,
  deleted_by_profile_id uuid,
  deletion_reason text,
  constraint pk_lead_attachments primary key (id),
  constraint uq_lead_attachments__storage_object unique (storage_bucket, storage_path),
  constraint fk_lead_attachments__lead_id__leads
    foreign key (lead_id) references public.leads (id) on delete restrict,
  constraint fk_lead_attachments__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_lead_attachments__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_lead_attachments__deleted_by_profile_id__profiles
    foreign key (deleted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_lead_attachments__owner_entity_type check (owner_entity_type = 'lead'),
  constraint ck_lead_attachments__storage_bucket check (storage_bucket = 'attachments'),
  constraint ck_lead_attachments__storage_path
    check (
      storage_path = btrim(storage_path)
      and storage_path !~ '(^/|\.\.|//)'
      and char_length(storage_path) between 3 and 1024
    ),
  constraint ck_lead_attachments__filename
    check (char_length(btrim(original_filename)) between 1 and 255),
  constraint ck_lead_attachments__mime_type
    check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  constraint ck_lead_attachments__size_bytes
    check (size_bytes between 1 and 10485760),
  constraint ck_lead_attachments__checksum_sha256
    check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  constraint ck_lead_attachments__status
    check (status in ('pending', 'available', 'quarantined', 'removed')),
  constraint ck_lead_attachments__deletion_state
    check (
      (
        deleted_at is null
        and deleted_by_profile_id is null
        and deletion_reason is null
      )
      or (
        deleted_at is not null
        and status = 'removed'
        and char_length(btrim(deletion_reason)) between 8 and 500
      )
    )
);

create table public.quotations (
  id uuid not null default gen_random_uuid(),
  quotation_number text not null default (
    'QT-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  lead_id uuid not null,
  revision_number integer not null default 1,
  status text not null default 'draft',
  currency text not null default 'SAR',
  subtotal_amount numeric(12, 2) not null,
  tax_amount numeric(12, 2) not null default 0,
  quoted_amount numeric(12, 2) not null,
  expires_at timestamp with time zone not null,
  sent_at timestamp with time zone,
  approved_at timestamp with time zone,
  approved_by_profile_id uuid,
  internal_notes text,
  customer_notes text,
  terms_ar text not null,
  terms_en text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  constraint pk_quotations primary key (id),
  constraint uq_quotations__quotation_number unique (quotation_number),
  constraint uq_quotations__lead_id_revision unique (lead_id, revision_number),
  constraint fk_quotations__lead_id__leads
    foreign key (lead_id) references public.leads (id) on delete restrict,
  constraint fk_quotations__approved_by_profile_id__profiles
    foreign key (approved_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_quotations__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_quotations__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_quotations__quotation_number
    check (quotation_number ~ '^QT-[0-9]{8}-[A-F0-9]{10}$'),
  constraint ck_quotations__revision_number_positive check (revision_number > 0),
  constraint ck_quotations__status
    check (status in ('draft', 'sent', 'approved', 'rejected', 'expired', 'superseded', 'cancelled')),
  constraint ck_quotations__currency check (currency ~ '^[A-Z]{3}$'),
  constraint ck_quotations__amounts
    check (
      subtotal_amount >= 0
      and tax_amount >= 0
      and quoted_amount = subtotal_amount + tax_amount
      and quoted_amount > 0
    ),
  constraint ck_quotations__expiry check (expires_at > created_at),
  constraint ck_quotations__sent_state
    check (status = 'draft' or status = 'cancelled' or sent_at is not null),
  constraint ck_quotations__approved_state
    check (
      (
        status = 'approved'
        and approved_at is not null
        and approved_by_profile_id is not null
      )
      or (
        status <> 'approved'
        and approved_at is null
        and approved_by_profile_id is null
      )
    ),
  constraint ck_quotations__internal_notes
    check (
      internal_notes is null
      or char_length(btrim(internal_notes)) between 2 and 5000
    ),
  constraint ck_quotations__customer_notes
    check (
      customer_notes is null
      or char_length(btrim(customer_notes)) between 2 and 3000
    ),
  constraint ck_quotations__localized_terms
    check (
      char_length(btrim(terms_ar)) between 8 and 10000
      and char_length(btrim(terms_en)) between 8 and 10000
    )
);

create table public.orders (
  id uuid not null default gen_random_uuid(),
  order_number text not null default (
    'OR-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  quotation_id uuid not null,
  execution_status text not null default 'created',
  scheduled_for timestamp with time zone,
  schedule_timezone text not null default 'Asia/Riyadh',
  execution_started_at timestamp with time zone,
  completed_at timestamp with time zone,
  tracking_mobile_number text not null,
  currency text not null,
  subtotal_amount numeric(12, 2) not null,
  tax_amount numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  operational_notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by_profile_id uuid,
  updated_by_profile_id uuid,
  constraint pk_orders primary key (id),
  constraint uq_orders__order_number unique (order_number),
  constraint uq_orders__quotation_id unique (quotation_id),
  constraint fk_orders__quotation_id__quotations
    foreign key (quotation_id) references public.quotations (id) on delete restrict,
  constraint fk_orders__created_by_profile_id__profiles
    foreign key (created_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_orders__updated_by_profile_id__profiles
    foreign key (updated_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_orders__order_number
    check (order_number ~ '^OR-[0-9]{8}-[A-F0-9]{10}$'),
  constraint ck_orders__execution_status
    check (execution_status in ('created', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  constraint ck_orders__schedule_timezone check (schedule_timezone = 'Asia/Riyadh'),
  constraint ck_orders__tracking_mobile
    check (tracking_mobile_number ~ '^\+9665[0-9]{8}$'),
  constraint ck_orders__currency check (currency ~ '^[A-Z]{3}$'),
  constraint ck_orders__amounts
    check (
      subtotal_amount >= 0
      and tax_amount >= 0
      and total_amount = subtotal_amount + tax_amount
      and total_amount > 0
    ),
  constraint ck_orders__schedule_state
    check (
      execution_status not in ('scheduled', 'in_progress', 'completed')
      or scheduled_for is not null
    ),
  constraint ck_orders__execution_state
    check (
      execution_status not in ('in_progress', 'completed')
      or execution_started_at is not null
    ),
  constraint ck_orders__completion_state
    check (execution_status <> 'completed' or completed_at is not null),
  constraint ck_orders__lifecycle_dates
    check (
      (execution_started_at is null or execution_started_at >= created_at)
      and (completed_at is null or completed_at >= execution_started_at)
    ),
  constraint ck_orders__operational_notes
    check (
      operational_notes is null
      or char_length(btrim(operational_notes)) between 2 and 5000
    )
);

create unique index uidx_service_options__global_option_key
  on public.service_options (option_key)
  where service_id is null;

create unique index uidx_service_options__service_option_key
  on public.service_options (service_id, option_key)
  where service_id is not null;

create unique index uidx_quotations__approved_lead
  on public.quotations (lead_id)
  where status = 'approved';

create index idx_cities__status_display_order
  on public.cities (status, display_order)
  where deleted_at is null;
create index idx_cities__name_ar on public.cities (lower(name_ar));
create index idx_cities__name_en on public.cities (lower(name_en));
create index idx_cities__region_en on public.cities (lower(region_en));
create index idx_cities__created_by_profile_id on public.cities (created_by_profile_id);
create index idx_cities__updated_by_profile_id on public.cities (updated_by_profile_id);
create index idx_cities__deleted_by_profile_id on public.cities (deleted_by_profile_id);

create index idx_services__status_display_order
  on public.services (status, display_order)
  where deleted_at is null;
create index idx_services__name_ar on public.services (lower(name_ar));
create index idx_services__name_en on public.services (lower(name_en));
create index idx_services__created_by_profile_id on public.services (created_by_profile_id);
create index idx_services__updated_by_profile_id on public.services (updated_by_profile_id);
create index idx_services__deleted_by_profile_id on public.services (deleted_by_profile_id);

create index idx_service_options__service_id_status
  on public.service_options (service_id, status)
  where deleted_at is null;
create index idx_service_options__name_ar on public.service_options (lower(name_ar));
create index idx_service_options__name_en on public.service_options (lower(name_en));
create index idx_service_options__created_by_profile_id
  on public.service_options (created_by_profile_id);
create index idx_service_options__updated_by_profile_id
  on public.service_options (updated_by_profile_id);
create index idx_service_options__deleted_by_profile_id
  on public.service_options (deleted_by_profile_id);

create index idx_addresses__profile_id on public.addresses (profile_id);
create index idx_addresses__city_id on public.addresses (city_id);
create index idx_addresses__provider_place_id on public.addresses (provider_place_id);
create index idx_addresses__coordinates on public.addresses (latitude, longitude);
create index idx_addresses__created_by_profile_id on public.addresses (created_by_profile_id);
create index idx_addresses__updated_by_profile_id on public.addresses (updated_by_profile_id);
create index idx_addresses__deleted_by_profile_id on public.addresses (deleted_by_profile_id);

create index idx_leads__profile_id on public.leads (profile_id);
create index idx_leads__service_id on public.leads (service_id);
create index idx_leads__pickup_address_id on public.leads (pickup_address_id);
create index idx_leads__delivery_address_id on public.leads (delivery_address_id);
create index idx_leads__mobile_number on public.leads (mobile_number);
create index idx_leads__email on public.leads (email) where email is not null;
create index idx_leads__status_created_at on public.leads (status, created_at desc);
create index idx_leads__created_by_profile_id on public.leads (created_by_profile_id);
create index idx_leads__updated_by_profile_id on public.leads (updated_by_profile_id);

create index idx_lead_attachments__lead_id_status
  on public.lead_attachments (lead_id, status)
  where deleted_at is null;
create index idx_lead_attachments__uploaded_at on public.lead_attachments (uploaded_at desc);
create index idx_lead_attachments__created_by_profile_id
  on public.lead_attachments (created_by_profile_id);
create index idx_lead_attachments__updated_by_profile_id
  on public.lead_attachments (updated_by_profile_id);
create index idx_lead_attachments__deleted_by_profile_id
  on public.lead_attachments (deleted_by_profile_id);

create index idx_quotations__lead_id_status on public.quotations (lead_id, status);
create index idx_quotations__expires_at on public.quotations (expires_at);
create index idx_quotations__approved_by_profile_id
  on public.quotations (approved_by_profile_id);
create index idx_quotations__created_by_profile_id
  on public.quotations (created_by_profile_id);
create index idx_quotations__updated_by_profile_id
  on public.quotations (updated_by_profile_id);

create index idx_orders__execution_status_scheduled_for
  on public.orders (execution_status, scheduled_for);
create index idx_orders__tracking_mobile_number on public.orders (tracking_mobile_number);
create index idx_orders__completed_at on public.orders (completed_at) where completed_at is not null;
create index idx_orders__created_by_profile_id on public.orders (created_by_profile_id);
create index idx_orders__updated_by_profile_id on public.orders (updated_by_profile_id);

create or replace function private.set_business_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
begin
  actor_profile_id := public.current_profile_id();

  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := new.created_at;
    new.created_by_profile_id := actor_profile_id;
    new.updated_by_profile_id := actor_profile_id;
  else
    new.created_at := old.created_at;
    new.created_by_profile_id := old.created_by_profile_id;
    new.updated_at := now();
    new.updated_by_profile_id := actor_profile_id;
  end if;

  return new;
end;
$$;

create or replace function private.protect_catalog_keys()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'cities'
    and (
      to_jsonb(new) ->> 'city_code' <> to_jsonb(old) ->> 'city_code'
      or to_jsonb(new) ->> 'slug' <> to_jsonb(old) ->> 'slug'
    )
  then
    raise exception using errcode = '23514', message = 'City keys are immutable';
  end if;

  if tg_table_name = 'services'
    and to_jsonb(new) ->> 'service_key' <> to_jsonb(old) ->> 'service_key'
  then
    raise exception using errcode = '23514', message = 'Service keys are immutable';
  end if;

  if tg_table_name = 'service_options'
    and (
      to_jsonb(new) ->> 'option_key' <> to_jsonb(old) ->> 'option_key'
      or to_jsonb(new) ->> 'service_id'
        is distinct from to_jsonb(old) ->> 'service_id'
    )
  then
    raise exception using errcode = '23514', message = 'Service option keys and scope are immutable';
  end if;

  return new;
end;
$$;

create or replace function private.protect_referenced_address()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.leads
    where leads.pickup_address_id = old.id
      or leads.delivery_address_id = old.id
  ) and (
    new.profile_id is distinct from old.profile_id
    or new.city_id <> old.city_id
    or new.formatted_address <> old.formatted_address
    or new.district is distinct from old.district
    or new.street_name is distinct from old.street_name
    or new.building_number is distinct from old.building_number
    or new.unit_number is distinct from old.unit_number
    or new.postal_code is distinct from old.postal_code
    or new.landmark is distinct from old.landmark
    or new.latitude is distinct from old.latitude
    or new.longitude is distinct from old.longitude
    or new.location_provider <> old.location_provider
    or new.provider_place_id is distinct from old.provider_place_id
    or new.location_precision is distinct from old.location_precision
    or new.route_access_notes is distinct from old.route_access_notes
    or new.deleted_at is distinct from old.deleted_at
  ) then
    raise exception using errcode = '23514', message = 'Addresses referenced by Leads are immutable';
  end if;

  return new;
end;
$$;

create or replace function private.validate_lead_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_exists boolean;
  delivery_owner uuid;
  option_count integer;
  pickup_exists boolean;
  pickup_owner uuid;
  selected_service record;
begin
  if tg_op = 'INSERT' and auth.role() = 'anon' then
    new.reference_number :=
      'LD-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') || '-'
      || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    new.profile_id := null;
    new.source := 'web';
    new.status := 'new';
    new.internal_notes := null;
    new.qualified_at := null;
    new.closed_at := null;
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.reference_number <> old.reference_number
      or new.profile_id is distinct from old.profile_id
      or new.submitted_at <> old.submitted_at
    then
      raise exception using errcode = '23514', message = 'Lead identity and ownership are immutable';
    end if;

    if new.status is distinct from old.status
      and not (
        (old.status = 'new' and new.status in ('qualified', 'cancelled', 'closed'))
        or (old.status = 'qualified' and new.status in ('quoted', 'cancelled', 'closed'))
        or (old.status = 'quoted' and new.status in ('converted', 'cancelled', 'closed'))
      )
    then
      raise exception using errcode = '23514', message = 'Unsupported Lead status transition';
    end if;
  end if;

  select id, service_key, name_ar, name_en, transport_scope
  into selected_service
  from public.services
  where id = new.service_id
    and status = 'active'
    and deleted_at is null;

  if selected_service.id is null then
    raise exception using errcode = '23514', message = 'Lead requires an active Service';
  end if;

  new.service_snapshot := jsonb_build_object(
    'id', selected_service.id,
    'service_key', selected_service.service_key,
    'name_ar', selected_service.name_ar,
    'name_en', selected_service.name_en,
    'transport_scope', selected_service.transport_scope
  );

  select
    count(*),
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', service_options.id,
          'option_key', service_options.option_key,
          'name_ar', service_options.name_ar,
          'name_en', service_options.name_en
        )
        order by requested_options.ordinality
      ),
      '[]'::jsonb
    )
  into option_count, new.service_options_snapshot
  from unnest(new.requested_service_option_ids) with ordinality as requested_options(id, ordinality)
  join public.service_options
    on service_options.id = requested_options.id
    and service_options.status = 'active'
    and service_options.deleted_at is null
    and (
      service_options.service_id is null
      or service_options.service_id = new.service_id
    );

  if option_count <> cardinality(new.requested_service_option_ids) then
    raise exception using errcode = '23514', message = 'Lead contains an unavailable Service Option';
  end if;

  if cardinality(new.requested_service_option_ids)
    <> cardinality(array(select distinct value from unnest(new.requested_service_option_ids) as value))
  then
    raise exception using errcode = '23514', message = 'Lead Service Options must be unique';
  end if;

  select true, profile_id
  into pickup_exists, pickup_owner
  from public.addresses
  where id = new.pickup_address_id
    and deleted_at is null;

  select true, profile_id
  into delivery_exists, delivery_owner
  from public.addresses
  where id = new.delivery_address_id
    and deleted_at is null;

  if coalesce(pickup_exists, false) = false
    or coalesce(delivery_exists, false) = false
    or pickup_owner is distinct from new.profile_id
    or delivery_owner is distinct from new.profile_id
  then
    raise exception using errcode = '23514', message = 'Lead addresses must exist and match Lead ownership';
  end if;

  if new.status = 'qualified' and new.qualified_at is null then
    new.qualified_at := now();
  end if;

  if new.status in ('closed', 'cancelled') and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

create or replace function private.protect_attachment_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and (
      new.id <> old.id
      or new.lead_id <> old.lead_id
      or new.owner_entity_type <> old.owner_entity_type
      or new.storage_bucket <> old.storage_bucket
      or new.storage_path <> old.storage_path
      or new.uploaded_at <> old.uploaded_at
    )
  then
    raise exception using errcode = '23514', message = 'Attachment ownership and Storage identity are immutable';
  end if;

  return new;
end;
$$;

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

create or replace function private.validate_order_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_quotation record;
begin
  if tg_op = 'INSERT' and new.execution_status <> 'created' then
    raise exception using errcode = '23514', message = 'New Orders must start in created status';
  end if;

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.order_number <> old.order_number
      or new.quotation_id <> old.quotation_id
    then
      raise exception using errcode = '23514', message = 'Order identity and source Quotation are immutable';
    end if;

    if new.currency <> old.currency
      or new.subtotal_amount <> old.subtotal_amount
      or new.tax_amount <> old.tax_amount
      or new.total_amount <> old.total_amount
      or new.tracking_mobile_number <> old.tracking_mobile_number
    then
      raise exception using errcode = '23514', message = 'Accepted Order financial and tracking snapshots are immutable';
    end if;

    if new.execution_status is distinct from old.execution_status
      and not (
        (old.execution_status = 'created' and new.execution_status in ('scheduled', 'cancelled'))
        or (old.execution_status = 'scheduled' and new.execution_status in ('in_progress', 'cancelled'))
        or (old.execution_status = 'in_progress' and new.execution_status in ('completed', 'cancelled'))
      )
    then
      raise exception using errcode = '23514', message = 'Unsupported Order execution transition';
    end if;
  end if;

  select
    quotations.status,
    quotations.expires_at,
    quotations.currency,
    quotations.subtotal_amount,
    quotations.tax_amount,
    quotations.quoted_amount,
    leads.mobile_number
  into source_quotation
  from public.quotations
  join public.leads on leads.id = quotations.lead_id
  where quotations.id = new.quotation_id;

  if source_quotation.status is distinct from 'approved'
    or source_quotation.expires_at <= now()
  then
    raise exception using errcode = '23514', message = 'Orders require an approved, unexpired Quotation';
  end if;

  if tg_op = 'INSERT' then
    new.currency := source_quotation.currency;
    new.subtotal_amount := source_quotation.subtotal_amount;
    new.tax_amount := source_quotation.tax_amount;
    new.total_amount := source_quotation.quoted_amount;
    new.tracking_mobile_number := source_quotation.mobile_number;
  end if;

  if new.execution_status = 'in_progress' and new.execution_started_at is null then
    new.execution_started_at := now();
  end if;

  if new.execution_status = 'completed' and new.completed_at is null then
    new.completed_at := now();
  end if;

  return new;
end;
$$;

create trigger trg_cities__before_insert_update__audit
before insert or update on public.cities
for each row execute function private.set_business_audit_fields();
create trigger trg_cities__before_update__protect_keys
before update on public.cities
for each row execute function private.protect_catalog_keys();

create trigger trg_services__before_insert_update__audit
before insert or update on public.services
for each row execute function private.set_business_audit_fields();
create trigger trg_services__before_update__protect_keys
before update on public.services
for each row execute function private.protect_catalog_keys();

create trigger trg_service_options__before_insert_update__audit
before insert or update on public.service_options
for each row execute function private.set_business_audit_fields();
create trigger trg_service_options__before_update__protect_keys
before update on public.service_options
for each row execute function private.protect_catalog_keys();

create trigger trg_addresses__before_insert_update__audit
before insert or update on public.addresses
for each row execute function private.set_business_audit_fields();
create trigger trg_addresses__before_update__protect_referenced
before update on public.addresses
for each row execute function private.protect_referenced_address();

create trigger trg_leads__before_insert_update__audit
before insert or update on public.leads
for each row execute function private.set_business_audit_fields();
create trigger trg_leads__before_insert_update__validate
before insert or update on public.leads
for each row execute function private.validate_lead_record();

create trigger trg_lead_attachments__before_insert_update__audit
before insert or update on public.lead_attachments
for each row execute function private.set_business_audit_fields();
create trigger trg_lead_attachments__before_update__protect
before update on public.lead_attachments
for each row execute function private.protect_attachment_record();

create trigger trg_quotations__before_insert_update__audit
before insert or update on public.quotations
for each row execute function private.set_business_audit_fields();
create trigger trg_quotations__before_insert_update__validate
before insert or update on public.quotations
for each row execute function private.validate_quotation_record();

create trigger trg_orders__before_insert_update__audit
before insert or update on public.orders
for each row execute function private.set_business_audit_fields();
create trigger trg_orders__before_insert_update__validate
before insert or update on public.orders
for each row execute function private.validate_order_record();

alter table public.cities enable row level security;
alter table public.services enable row level security;
alter table public.service_options enable row level security;
alter table public.addresses enable row level security;
alter table public.leads enable row level security;
alter table public.lead_attachments enable row level security;
alter table public.quotations enable row level security;
alter table public.orders enable row level security;

comment on table public.cities is
  'Saudi city reference catalog used by service addresses and launch coverage decisions.';
comment on table public.services is
  'Bilingual configurable catalog of Naqlia core transport services.';
comment on table public.service_options is
  'Bilingual optional services; a null service_id makes an option globally eligible.';
comment on table public.addresses is
  'Address records with Google Maps identifiers, coordinates, and future routing context.';
comment on column public.addresses.provider_place_id is
  'Google Place ID or another provider reference; never used as an authorization key.';
comment on column public.addresses.route_access_notes is
  'Human routing/access context for future dispatch use; not a routing-engine result.';
comment on table public.leads is
  'Guest-first service requests. profile_id is optional and null for unauthenticated guests.';
comment on column public.leads.requested_service_option_ids is
  'Selected Service Option IDs validated by a trigger; a join table is intentionally deferred for MVP.';
comment on column public.leads.service_snapshot is
  'Immutable-at-submission bilingual Service snapshot retained when catalog text later changes.';
comment on table public.lead_attachments is
  'Lead-owned Supabase Storage metadata only; file bytes remain in the attachments bucket.';
comment on column public.lead_attachments.storage_path is
  'Canonical object path in Supabase Storage. No foreign key to storage.objects is created.';
comment on table public.quotations is
  'Versioned commercial offers reviewed by staff before customer approval.';
comment on table public.orders is
  'Operational commitments created once from approved, unexpired Quotations.';
comment on column public.orders.tracking_mobile_number is
  'Immutable mobile snapshot for the future approved Order Number plus Mobile tracking flow.';

commit;
