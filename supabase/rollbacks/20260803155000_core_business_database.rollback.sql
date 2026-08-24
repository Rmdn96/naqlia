begin;

delete from public.role_permissions
where permission_id in (
  select id
  from public.permissions
  where permission_key in (
    'catalog.city.read',
    'catalog.city.manage',
    'catalog.service.read',
    'catalog.service.manage',
    'customer.address.read',
    'customer.address.manage',
    'lead.record.read',
    'lead.record.manage',
    'document.attachment.read',
    'document.attachment.manage',
    'quotation.record.read',
    'quotation.record.manage',
    'quotation.record.approve',
    'order.record.read',
    'order.record.manage'
  )
);

delete from public.permissions
where permission_key in (
  'catalog.city.read',
  'catalog.city.manage',
  'catalog.service.read',
  'catalog.service.manage',
  'customer.address.read',
  'customer.address.manage',
  'lead.record.read',
  'lead.record.manage',
  'document.attachment.read',
  'document.attachment.manage',
  'quotation.record.read',
  'quotation.record.manage',
  'quotation.record.approve',
  'order.record.read',
  'order.record.manage'
);

drop table public.orders;
drop table public.quotations;
drop table public.lead_attachments;
drop table public.leads;
drop table public.addresses;
drop table public.service_options;
drop table public.services;
drop table public.cities;

drop function private.validate_order_record();
drop function private.validate_quotation_record();
drop function private.protect_attachment_record();
drop function private.validate_lead_record();
drop function private.protect_referenced_address();
drop function private.protect_catalog_keys();
drop function private.set_business_audit_fields();

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

grant execute on function public.assign_staff_role(uuid, text, text)
  to authenticated;
grant execute on function public.revoke_staff_role(uuid, text)
  to authenticated;
grant execute on function public.set_profile_status(uuid, text, text)
  to authenticated;

drop function private.has_permission_authoritative(text);
drop function private.current_profile_id_authoritative();
revoke usage on schema private from authenticated, service_role;

commit;
