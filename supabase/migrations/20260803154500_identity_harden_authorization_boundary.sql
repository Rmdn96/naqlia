begin;

create or replace function private.current_profile_id_authoritative()
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

create or replace function private.has_permission_authoritative(
  requested_permission text
)
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

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select private.current_profile_id_authoritative()
$$;

create or replace function public.has_permission(requested_permission text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.has_permission_authoritative(requested_permission)
$$;

revoke all on function private.current_profile_id_authoritative()
  from public, anon, authenticated;
revoke all on function private.has_permission_authoritative(text)
  from public, anon, authenticated;

grant usage on schema private to authenticated, service_role;
grant execute on function private.current_profile_id_authoritative()
  to authenticated, service_role;
grant execute on function private.has_permission_authoritative(text)
  to authenticated, service_role;

revoke execute on function public.assign_staff_role(uuid, text, text)
  from authenticated;
revoke execute on function public.revoke_staff_role(uuid, text)
  from authenticated;
revoke execute on function public.set_profile_status(uuid, text, text)
  from authenticated;

comment on function public.has_permission(text) is
  'Security-invoker API wrapper over the non-exposed authoritative RBAC evaluator.';
comment on function private.has_permission_authoritative(text) is
  'Non-exposed security-definer RBAC evaluator used by RLS and the public invoker wrapper.';

commit;
