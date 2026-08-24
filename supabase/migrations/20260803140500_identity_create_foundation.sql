begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid not null default gen_random_uuid(),
  auth_user_id uuid,
  profile_kind text not null default 'customer',
  status text not null default 'pending',
  display_name text,
  preferred_locale text not null default 'ar',
  status_reason text,
  status_changed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  version integer not null default 1,
  constraint pk_profiles primary key (id),
  constraint fk_profiles__auth_user_id__auth_users
    foreign key (auth_user_id) references auth.users (id) on delete set null,
  constraint uq_profiles__auth_user_id unique (auth_user_id),
  constraint ck_profiles__profile_kind
    check (profile_kind in ('customer', 'staff')),
  constraint ck_profiles__status
    check (status in ('pending', 'active', 'suspended', 'closed')),
  constraint ck_profiles__preferred_locale
    check (preferred_locale in ('ar', 'en')),
  constraint ck_profiles__display_name
    check (
      display_name is null
      or char_length(btrim(display_name)) between 2 and 120
    ),
  constraint ck_profiles__status_reason
    check (
      status not in ('suspended', 'closed')
      or char_length(btrim(status_reason)) between 8 and 500
    ),
  constraint ck_profiles__active_auth_user
    check (status <> 'active' or auth_user_id is not null),
  constraint ck_profiles__detached_is_closed
    check (auth_user_id is not null or status = 'closed'),
  constraint ck_profiles__version_positive check (version > 0)
);

create table public.roles (
  id uuid not null default gen_random_uuid(),
  role_key text not null,
  name_ar text not null,
  name_en text not null,
  description_ar text not null,
  description_en text not null,
  status text not null default 'active',
  is_system boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pk_roles primary key (id),
  constraint uq_roles__role_key unique (role_key),
  constraint ck_roles__role_key
    check (role_key ~ '^[a-z][a-z0-9_]{2,49}$'),
  constraint ck_roles__localized_names
    check (
      char_length(btrim(name_ar)) between 2 and 100
      and char_length(btrim(name_en)) between 2 and 100
    ),
  constraint ck_roles__localized_descriptions
    check (
      char_length(btrim(description_ar)) between 8 and 500
      and char_length(btrim(description_en)) between 8 and 500
    ),
  constraint ck_roles__status
    check (status in ('active', 'retired'))
);

create table public.permissions (
  id uuid not null default gen_random_uuid(),
  permission_key text not null,
  description_ar text not null,
  description_en text not null,
  risk_level text not null,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pk_permissions primary key (id),
  constraint uq_permissions__permission_key unique (permission_key),
  constraint ck_permissions__permission_key
    check (
      permission_key
      ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'
    ),
  constraint ck_permissions__localized_descriptions
    check (
      char_length(btrim(description_ar)) between 8 and 500
      and char_length(btrim(description_en)) between 8 and 500
    ),
  constraint ck_permissions__risk_level
    check (risk_level in ('low', 'medium', 'high', 'critical')),
  constraint ck_permissions__status
    check (status in ('active', 'deprecated', 'retired'))
);

create table public.role_permissions (
  id uuid not null default gen_random_uuid(),
  role_id uuid not null,
  permission_id uuid not null,
  status text not null default 'active',
  grant_reason text not null,
  granted_at timestamp with time zone not null default now(),
  granted_by_profile_id uuid,
  revoked_at timestamp with time zone,
  revoked_by_profile_id uuid,
  revocation_reason text,
  constraint pk_role_permissions primary key (id),
  constraint fk_role_permissions__role_id__roles
    foreign key (role_id) references public.roles (id) on delete restrict,
  constraint fk_role_permissions__permission_id__permissions
    foreign key (permission_id) references public.permissions (id) on delete restrict,
  constraint fk_role_permissions__granted_by_profile_id__profiles
    foreign key (granted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_role_permissions__revoked_by_profile_id__profiles
    foreign key (revoked_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_role_permissions__status
    check (status in ('active', 'revoked')),
  constraint ck_role_permissions__grant_reason
    check (char_length(btrim(grant_reason)) between 8 and 500),
  constraint ck_role_permissions__revocation_state
    check (
      (
        status = 'active'
        and revoked_at is null
        and revoked_by_profile_id is null
        and revocation_reason is null
      )
      or (
        status = 'revoked'
        and revoked_at is not null
        and char_length(btrim(revocation_reason)) between 8 and 500
      )
    )
);

create table public.profile_roles (
  id uuid not null default gen_random_uuid(),
  profile_id uuid not null,
  role_id uuid not null,
  status text not null default 'active',
  grant_reason text not null,
  granted_at timestamp with time zone not null default now(),
  granted_by_profile_id uuid,
  revoked_at timestamp with time zone,
  revoked_by_profile_id uuid,
  revocation_reason text,
  constraint pk_profile_roles primary key (id),
  constraint fk_profile_roles__profile_id__profiles
    foreign key (profile_id) references public.profiles (id) on delete restrict,
  constraint fk_profile_roles__role_id__roles
    foreign key (role_id) references public.roles (id) on delete restrict,
  constraint fk_profile_roles__granted_by_profile_id__profiles
    foreign key (granted_by_profile_id) references public.profiles (id) on delete restrict,
  constraint fk_profile_roles__revoked_by_profile_id__profiles
    foreign key (revoked_by_profile_id) references public.profiles (id) on delete restrict,
  constraint ck_profile_roles__status
    check (status in ('active', 'revoked')),
  constraint ck_profile_roles__grant_reason
    check (char_length(btrim(grant_reason)) between 8 and 500),
  constraint ck_profile_roles__revocation_state
    check (
      (
        status = 'active'
        and revoked_at is null
        and revoked_by_profile_id is null
        and revocation_reason is null
      )
      or (
        status = 'revoked'
        and revoked_at is not null
        and char_length(btrim(revocation_reason)) between 8 and 500
      )
    )
);

create index idx_profiles__status
  on public.profiles (status);

create index idx_roles__status
  on public.roles (status);

create index idx_permissions__status
  on public.permissions (status);

create index idx_role_permissions__role_id_status
  on public.role_permissions (role_id, status);

create index idx_role_permissions__permission_id_status
  on public.role_permissions (permission_id, status);

create unique index uidx_role_permissions__active_role_permission
  on public.role_permissions (role_id, permission_id)
  where status = 'active';

create index idx_profile_roles__profile_id_status
  on public.profile_roles (profile_id, status);

create index idx_profile_roles__role_id_status
  on public.profile_roles (role_id, status);

create unique index uidx_profile_roles__active_profile
  on public.profile_roles (profile_id)
  where status = 'active';

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.protect_profile_invariants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_role_count integer;
begin
  if new.auth_user_id is distinct from old.auth_user_id then
    if not (
      old.auth_user_id is not null
      and new.auth_user_id is null
      and new.status = 'closed'
    ) then
      raise exception using
        errcode = '23514',
        message = 'Profile authentication identity is immutable';
    end if;
  end if;

  if old.status = 'closed' and new.status <> 'closed' then
    raise exception using
      errcode = '23514',
      message = 'Closed profiles cannot be reactivated';
  end if;

  if old.status = 'active' and new.status <> 'active' then
    if exists (
      select 1
      from public.profile_roles
      join public.roles on roles.id = profile_roles.role_id
      where profile_roles.profile_id = old.id
        and profile_roles.status = 'active'
        and roles.role_key = 'super_admin'
    ) and not exists (
      select 1
      from public.profiles as other_profiles
      join public.profile_roles as other_assignments
        on other_assignments.profile_id = other_profiles.id
        and other_assignments.status = 'active'
      join public.roles as other_roles
        on other_roles.id = other_assignments.role_id
        and other_roles.role_key = 'super_admin'
      where other_profiles.id <> old.id
        and other_profiles.profile_kind = 'staff'
        and other_profiles.status = 'active'
    ) then
      raise exception using
        errcode = '23514',
        message = 'The last active Super Admin cannot be deactivated';
    end if;
  end if;

  select count(*)
  into active_role_count
  from public.profile_roles
  where profile_id = new.id
    and status = 'active';

  if new.profile_kind = 'customer' and active_role_count > 0 then
    raise exception using
      errcode = '23514',
      message = 'Customer profiles cannot hold staff roles';
  end if;

  if new.profile_kind = 'staff'
    and new.status = 'active'
    and active_role_count <> 1
  then
    raise exception using
      errcode = '23514',
      message = 'Active staff profiles require exactly one active role';
  end if;

  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;

  new.updated_at := now();
  new.version := old.version + 1;

  return new;
end;
$$;

create or replace function private.protect_reference_keys()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'roles' and new.role_key <> old.role_key then
    raise exception using
      errcode = '23514',
      message = 'Role keys are immutable';
  end if;

  if tg_table_name = 'permissions'
    and new.permission_key <> old.permission_key
  then
    raise exception using
      errcode = '23514',
      message = 'Permission keys are immutable';
  end if;

  return new;
end;
$$;

create or replace function private.validate_profile_role_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_kind text;
  target_status text;
  target_role_status text;
begin
  if tg_op = 'UPDATE' then
    if new.profile_id <> old.profile_id
      or new.role_id <> old.role_id
      or new.granted_at <> old.granted_at
      or new.granted_by_profile_id is distinct from old.granted_by_profile_id
    then
      raise exception using
        errcode = '23514',
        message = 'Role assignments cannot be re-parented or re-attributed';
    end if;
  end if;

  if new.status = 'active' then
    select profile_kind, status
    into target_kind, target_status
    from public.profiles
    where id = new.profile_id;

    select status
    into target_role_status
    from public.roles
    where id = new.role_id;

    if target_kind is distinct from 'staff'
      or target_status not in ('pending', 'active', 'suspended')
      or target_role_status is distinct from 'active'
    then
      raise exception using
        errcode = '23514',
        message = 'Active role assignments require an eligible staff profile and active role';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.validate_active_staff_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  target_kind text;
  target_status text;
  active_role_count integer;
begin
  if tg_op = 'DELETE' then
    target_profile_id := old.profile_id;
  else
    target_profile_id := new.profile_id;
  end if;

  select profile_kind, status
  into target_kind, target_status
  from public.profiles
  where id = target_profile_id;

  if target_kind = 'staff' and target_status = 'active' then
    select count(*)
    into active_role_count
    from public.profile_roles
    where profile_id = target_profile_id
      and status = 'active';

    if active_role_count <> 1 then
      raise exception using
        errcode = '23514',
        message = 'Active staff profiles require exactly one active role';
    end if;
  end if;

  return null;
end;
$$;

create or replace function private.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    auth_user_id,
    profile_kind,
    status,
    display_name,
    preferred_locale
  )
  values (
    new.id,
    'customer',
    'pending',
    null,
    case
      when new.raw_user_meta_data ->> 'preferred_locale' in ('ar', 'en')
        then new.raw_user_meta_data ->> 'preferred_locale'
      else 'ar'
    end
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

create or replace function private.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    status = 'closed',
    status_reason = 'Supabase Auth user deleted',
    status_changed_at = now()
  where auth_user_id = old.id
    and status <> 'closed';

  return old;
end;
$$;

create trigger trg_profiles__before_update__protect_invariants
before update on public.profiles
for each row execute function private.protect_profile_invariants();

create trigger trg_roles__before_update__protect_key
before update on public.roles
for each row execute function private.protect_reference_keys();

create trigger trg_roles__before_update__timestamp
before update on public.roles
for each row execute function private.set_updated_at();

create trigger trg_permissions__before_update__protect_key
before update on public.permissions
for each row execute function private.protect_reference_keys();

create trigger trg_permissions__before_update__timestamp
before update on public.permissions
for each row execute function private.set_updated_at();

create trigger trg_profile_roles__before_write__validate
before insert or update on public.profile_roles
for each row execute function private.validate_profile_role_assignment();

create constraint trigger trg_profile_roles__after_change__validate_staff
after insert or update or delete on public.profile_roles
deferrable initially deferred
for each row execute function private.validate_active_staff_role();

create trigger trg_auth_users__after_insert__create_profile
after insert on auth.users
for each row execute function private.handle_auth_user_created();

create trigger trg_auth_users__before_delete__close_profile
before delete on auth.users
for each row execute function private.handle_auth_user_deleted();

insert into public.profiles (
  auth_user_id,
  profile_kind,
  status,
  display_name,
  preferred_locale
)
select
  users.id,
  'customer',
  'pending',
  null,
  'ar'
from auth.users as users
on conflict (auth_user_id) do nothing;

insert into public.roles (
  role_key,
  name_ar,
  name_en,
  description_ar,
  description_en
)
values
  (
    'super_admin',
    'المشرف العام',
    'Super Admin',
    'إدارة البنية التقنية للهوية والصلاحيات ضمن ضوابط الأمان.',
    'Administers identity and access infrastructure within security controls.'
  ),
  (
    'sales',
    'المبيعات',
    'Sales',
    'دور موظفي المبيعات دون منح صلاحيات أعمال في هذا الإصدار.',
    'Sales staff role without business permissions in this foundation.'
  ),
  (
    'operations',
    'العمليات',
    'Operations',
    'دور موظفي العمليات دون منح صلاحيات أعمال في هذا الإصدار.',
    'Operations staff role without business permissions in this foundation.'
  ),
  (
    'finance',
    'المالية',
    'Finance',
    'دور موظفي المالية دون منح صلاحيات أعمال في هذا الإصدار.',
    'Finance staff role without business permissions in this foundation.'
  ),
  (
    'customer_service',
    'خدمة العملاء',
    'Customer Service',
    'دور موظفي خدمة العملاء دون منح صلاحيات أعمال في هذا الإصدار.',
    'Customer Service staff role without business permissions in this foundation.'
  )
on conflict (role_key) do update
set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  status = 'active';

insert into public.permissions (
  permission_key,
  description_ar,
  description_en,
  risk_level
)
values
  (
    'identity.profile.read',
    'عرض الملفات الشخصية للمستخدمين الموثقين ضمن نطاق الإدارة.',
    'Read authenticated-user profiles within the administrative scope.',
    'high'
  ),
  (
    'identity.profile.manage',
    'إدارة حالة الملفات الشخصية للموظفين ضمن دورة حياة معتمدة.',
    'Manage staff profile status through the approved identity lifecycle.',
    'critical'
  ),
  (
    'identity.role.read',
    'عرض تعريفات الأدوار وتعييناتها المعتمدة.',
    'Read approved role definitions and assignments.',
    'medium'
  ),
  (
    'identity.permission.read',
    'عرض قاموس صلاحيات المنصة وروابط الأدوار.',
    'Read the platform permission vocabulary and role bindings.',
    'high'
  ),
  (
    'identity.assignment.manage',
    'منح أدوار الموظفين أو إلغاؤها مع حفظ السبب والمصدر.',
    'Grant or revoke staff roles with reason and actor provenance.',
    'critical'
  )
on conflict (permission_key) do update
set
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  risk_level = excluded.risk_level,
  status = 'active';

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
  'Initial identity foundation grant'
from public.roles
cross join public.permissions
where roles.role_key = 'super_admin'
on conflict (role_id, permission_id) where status = 'active' do nothing;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profiles.id
  from public.profiles
  where profiles.auth_user_id = auth.uid()
    and profiles.status = 'active'
  limit 1
$$;

create or replace function public.has_permission(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    join public.profile_roles
      on profile_roles.profile_id = profiles.id
      and profile_roles.status = 'active'
    join public.roles
      on roles.id = profile_roles.role_id
      and roles.status = 'active'
    join public.role_permissions
      on role_permissions.role_id = roles.id
      and role_permissions.status = 'active'
    join public.permissions
      on permissions.id = role_permissions.permission_id
      and permissions.status = 'active'
    where profiles.auth_user_id = auth.uid()
      and profiles.profile_kind = 'staff'
      and profiles.status = 'active'
      and permissions.permission_key = requested_permission
  )
$$;

create or replace function public.assign_staff_role(
  target_profile_id uuid,
  target_role_key text,
  change_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  assignment_id uuid;
  existing_role_id uuid;
  selected_role_id uuid;
  target_kind text;
  target_status text;
begin
  if not public.has_permission('identity.assignment.manage') then
    raise exception using errcode = '42501', message = 'Not authorized';
  end if;

  if char_length(btrim(change_reason)) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'A valid change reason is required';
  end if;

  actor_profile_id := public.current_profile_id();

  select profile_kind, status
  into target_kind, target_status
  from public.profiles
  where id = target_profile_id
  for update;

  if not found or target_kind <> 'staff' or target_status = 'closed' then
    raise exception using errcode = '22023', message = 'Target staff profile is not eligible';
  end if;

  select id
  into selected_role_id
  from public.roles
  where role_key = target_role_key
    and status = 'active';

  if selected_role_id is null then
    raise exception using errcode = '22023', message = 'Target role is not active';
  end if;

  select id, role_id
  into assignment_id, existing_role_id
  from public.profile_roles
  where profile_id = target_profile_id
    and status = 'active'
  for update;

  if existing_role_id = selected_role_id then
    if target_status <> 'active' then
      update public.profiles
      set
        status = 'active',
        status_reason = change_reason
      where id = target_profile_id;
    end if;

    return assignment_id;
  end if;

  if target_status = 'active' then
    update public.profiles
    set
      status = 'suspended',
      status_reason = 'Role reassignment in progress'
    where id = target_profile_id;
  end if;

  update public.profile_roles
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by_profile_id = actor_profile_id,
    revocation_reason = change_reason
  where profile_id = target_profile_id
    and status = 'active';

  insert into public.profile_roles (
    profile_id,
    role_id,
    status,
    grant_reason,
    granted_by_profile_id
  )
  values (
    target_profile_id,
    selected_role_id,
    'active',
    change_reason,
    actor_profile_id
  )
  returning id into assignment_id;

  update public.profiles
  set
    status = 'active',
    status_reason = change_reason
  where id = target_profile_id;

  return assignment_id;
end;
$$;

create or replace function public.revoke_staff_role(
  target_profile_id uuid,
  change_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
begin
  if not public.has_permission('identity.assignment.manage') then
    raise exception using errcode = '42501', message = 'Not authorized';
  end if;

  if char_length(btrim(change_reason)) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'A valid change reason is required';
  end if;

  actor_profile_id := public.current_profile_id();

  update public.profiles
  set
    status = 'suspended',
    status_reason = change_reason
  where id = target_profile_id
    and profile_kind = 'staff'
    and status in ('pending', 'active', 'suspended');

  if not found then
    raise exception using errcode = '22023', message = 'Target staff profile is not eligible';
  end if;

  update public.profile_roles
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by_profile_id = actor_profile_id,
    revocation_reason = change_reason
  where profile_id = target_profile_id
    and status = 'active';

  return found;
end;
$$;

create or replace function public.set_profile_status(
  target_profile_id uuid,
  target_status text,
  change_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
begin
  if not public.has_permission('identity.profile.manage') then
    raise exception using errcode = '42501', message = 'Not authorized';
  end if;

  if target_status not in ('active', 'suspended', 'closed') then
    raise exception using errcode = '22023', message = 'Unsupported profile status';
  end if;

  if char_length(btrim(change_reason)) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'A valid change reason is required';
  end if;

  actor_profile_id := public.current_profile_id();

  if target_status = 'closed' then
    update public.profiles
    set
      status = 'suspended',
      status_reason = change_reason
    where id = target_profile_id
      and status in ('pending', 'active', 'suspended');

    if not found then
      return false;
    end if;

    update public.profile_roles
    set
      status = 'revoked',
      revoked_at = now(),
      revoked_by_profile_id = actor_profile_id,
      revocation_reason = change_reason
    where profile_id = target_profile_id
      and status = 'active';
  end if;

  update public.profiles
  set
    status = target_status,
    status_reason = change_reason
  where id = target_profile_id
    and status <> 'closed';

  return found;
end;
$$;

create or replace function public.provision_staff_identity(
  target_auth_user_id uuid,
  target_role_key text,
  target_display_name text,
  change_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  assignment_id uuid;
  existing_role_id uuid;
  profile_kind text;
  profile_status text;
  selected_role_id uuid;
  target_profile_record_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception using errcode = '42501', message = 'Not authorized';
  end if;

  if char_length(btrim(target_display_name)) not between 2 and 120 then
    raise exception using errcode = '22023', message = 'A valid display name is required';
  end if;

  if char_length(btrim(change_reason)) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'A valid change reason is required';
  end if;

  select id, profiles.profile_kind, profiles.status
  into target_profile_record_id, profile_kind, profile_status
  from public.profiles
  where auth_user_id = target_auth_user_id
  for update;

  if target_profile_record_id is null or profile_status = 'closed' then
    raise exception using errcode = '22023', message = 'Authentication profile is not eligible';
  end if;

  if profile_kind = 'customer' and profile_status <> 'pending' then
    raise exception using
      errcode = '22023',
      message = 'An established customer identity cannot become a workforce identity';
  end if;

  select id
  into selected_role_id
  from public.roles
  where role_key = target_role_key
    and status = 'active';

  if selected_role_id is null then
    raise exception using errcode = '22023', message = 'Target role is not active';
  end if;

  select id, role_id
  into assignment_id, existing_role_id
  from public.profile_roles
  where public.profile_roles.profile_id = target_profile_record_id
    and status = 'active'
  for update;

  if existing_role_id = selected_role_id and profile_status = 'active' then
    update public.profiles
    set display_name = btrim(target_display_name)
    where id = target_profile_record_id;

    return assignment_id;
  end if;

  update public.profiles
  set
    profile_kind = 'staff',
    status = 'suspended',
    display_name = btrim(target_display_name),
    status_reason = 'Staff provisioning in progress'
  where id = target_profile_record_id;

  update public.profile_roles
  set
    status = 'revoked',
    revoked_at = now(),
    revocation_reason = change_reason
  where public.profile_roles.profile_id = target_profile_record_id
    and status = 'active';

  insert into public.profile_roles (
    profile_id,
    role_id,
    status,
    grant_reason
  )
  values (
    target_profile_record_id,
    selected_role_id,
    'active',
    change_reason
  )
  returning id into assignment_id;

  update public.profiles
  set
    status = 'active',
    status_reason = change_reason
  where id = target_profile_record_id;

  return assignment_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_roles enable row level security;

create policy rls_profiles__select__self_or_profile_reader
on public.profiles
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or (select public.has_permission('identity.profile.read'))
);

create policy rls_roles__select__assigned_or_role_reader
on public.roles
for select
to authenticated
using (
  exists (
    select 1
    from public.profile_roles
    where profile_roles.profile_id = (select public.current_profile_id())
      and profile_roles.role_id = roles.id
      and profile_roles.status = 'active'
  )
  or (select public.has_permission('identity.role.read'))
);

create policy rls_permissions__select__permission_reader
on public.permissions
for select
to authenticated
using ((select public.has_permission('identity.permission.read')));

create policy rls_role_permissions__select__assigned_or_role_reader
on public.role_permissions
for select
to authenticated
using (
  exists (
    select 1
    from public.profile_roles
    where profile_roles.profile_id = (select public.current_profile_id())
      and profile_roles.role_id = role_permissions.role_id
      and profile_roles.status = 'active'
  )
  or (select public.has_permission('identity.role.read'))
);

create policy rls_profile_roles__select__self_or_assignment_manager
on public.profile_roles
for select
to authenticated
using (
  profile_id = (select public.current_profile_id())
  or (select public.has_permission('identity.assignment.manage'))
);

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.roles from public, anon, authenticated;
revoke all on table public.permissions from public, anon, authenticated;
revoke all on table public.role_permissions from public, anon, authenticated;
revoke all on table public.profile_roles from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.permissions to authenticated;
grant select on table public.role_permissions to authenticated;
grant select on table public.profile_roles to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.roles to service_role;
grant all on table public.permissions to service_role;
grant all on table public.role_permissions to service_role;
grant all on table public.profile_roles to service_role;

revoke all on function public.current_profile_id() from public, anon;
revoke all on function public.has_permission(text) from public, anon;
revoke all on function public.assign_staff_role(uuid, text, text) from public, anon;
revoke all on function public.revoke_staff_role(uuid, text) from public, anon;
revoke all on function public.set_profile_status(uuid, text, text) from public, anon;
revoke all on function public.provision_staff_identity(uuid, text, text, text)
  from public, anon, authenticated;

grant execute on function public.current_profile_id() to authenticated, service_role;
grant execute on function public.has_permission(text) to authenticated, service_role;
grant execute on function public.assign_staff_role(uuid, text, text) to authenticated;
grant execute on function public.revoke_staff_role(uuid, text) to authenticated;
grant execute on function public.set_profile_status(uuid, text, text) to authenticated;
grant execute on function public.provision_staff_identity(uuid, text, text, text)
  to service_role;

revoke all on all functions in schema private from public, anon, authenticated;

comment on table public.profiles is
  'Application profiles for authenticated identities only; guests never require a profile.';
comment on table public.roles is
  'Fixed Naqlia MVP internal staff role definitions.';
comment on table public.permissions is
  'Stable platform permission vocabulary; Sprint 1B contains identity permissions only.';
comment on table public.role_permissions is
  'Immutable-provenance grants connecting roles to permissions.';
comment on table public.profile_roles is
  'Effective staff role assignments with grant and revocation provenance.';
comment on function public.has_permission(text) is
  'Checks the current authenticated staff profile against authoritative active RBAC records.';

commit;
