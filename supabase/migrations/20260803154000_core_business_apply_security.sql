begin;

insert into public.permissions (
  permission_key,
  description_ar,
  description_en,
  risk_level
)
values
  (
    'catalog.city.read',
    'عرض كتالوج المدن السعودية وحالات التوفر التشغيلية.',
    'Read the Saudi city catalog and operational availability state.',
    'low'
  ),
  (
    'catalog.city.manage',
    'إدارة كتالوج المدن السعودية ضمن ضوابط النشر المعتمدة.',
    'Manage the Saudi city catalog through approved publication controls.',
    'high'
  ),
  (
    'catalog.service.read',
    'عرض الخدمات وخيارات الخدمة المنشورة أو المتاحة للموظف.',
    'Read published or staff-visible Services and Service Options.',
    'low'
  ),
  (
    'catalog.service.manage',
    'إدارة الخدمات وخياراتها ضمن ضوابط النشر المعتمدة.',
    'Manage Services and Service Options through approved publication controls.',
    'high'
  ),
  (
    'customer.address.read',
    'عرض العناوين اللازمة لتنفيذ المهمة المصرح بها.',
    'Read addresses required for the authorized business duty.',
    'high'
  ),
  (
    'customer.address.manage',
    'إدارة العناوين غير التاريخية ضمن نطاق العمل المصرح.',
    'Manage non-historical addresses within the authorized work scope.',
    'high'
  ),
  (
    'lead.record.read',
    'عرض طلبات الخدمة ضمن نطاق العمل المصرح.',
    'Read Leads within the authorized duty scope.',
    'high'
  ),
  (
    'lead.record.manage',
    'تأهيل طلبات الخدمة وتحديث دورة حياتها المصرح بها.',
    'Qualify Leads and manage their permitted lifecycle.',
    'high'
  ),
  (
    'document.attachment.read',
    'عرض بيانات مرفقات الطلبات ضمن نطاق المهمة المصرح.',
    'Read Lead attachment metadata within the authorized duty scope.',
    'high'
  ),
  (
    'document.attachment.manage',
    'إدارة بيانات مرفقات الطلبات وحالات الفحص المصرح بها.',
    'Manage Lead attachment metadata and permitted inspection states.',
    'high'
  ),
  (
    'quotation.record.read',
    'عرض عروض الأسعار والحقول التجارية المصرح بها.',
    'Read Quotations and authorized commercial fields.',
    'high'
  ),
  (
    'quotation.record.manage',
    'إنشاء عروض الأسعار وإصدارها ضمن مراجعة المبيعات الإلزامية.',
    'Create and issue Quotations under mandatory Sales review.',
    'high'
  ),
  (
    'quotation.record.approve',
    'اعتماد عرض السعر ضمن الصلاحية التجارية المخولة.',
    'Approve a Quotation within delegated commercial authority.',
    'critical'
  ),
  (
    'order.record.read',
    'عرض الطلبات المؤكدة ضمن نطاق المهمة المصرح.',
    'Read confirmed Orders within the authorized duty scope.',
    'high'
  ),
  (
    'order.record.manage',
    'جدولة الطلبات وتنفيذ انتقالاتها التشغيلية المصرح بها.',
    'Schedule Orders and perform permitted operational transitions.',
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
  'Sprint 2A core business database grant'
from public.roles
cross join public.permissions
where roles.role_key = 'super_admin'
  and permissions.permission_key in (
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
on conflict (role_id, permission_id) where status = 'active' do nothing;

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
  'Sprint 2A Sales responsibility grant'
from public.roles
cross join public.permissions
where roles.role_key = 'sales'
  and permissions.permission_key in (
    'catalog.city.read',
    'catalog.service.read',
    'customer.address.read',
    'lead.record.read',
    'lead.record.manage',
    'document.attachment.read',
    'document.attachment.manage',
    'quotation.record.read',
    'quotation.record.manage',
    'quotation.record.approve',
    'order.record.read'
  )
on conflict (role_id, permission_id) where status = 'active' do nothing;

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
  'Sprint 2A Operations responsibility grant'
from public.roles
cross join public.permissions
where roles.role_key = 'operations'
  and permissions.permission_key in (
    'catalog.city.read',
    'catalog.service.read',
    'customer.address.read',
    'lead.record.read',
    'document.attachment.read',
    'document.attachment.manage',
    'quotation.record.read',
    'order.record.read',
    'order.record.manage'
  )
on conflict (role_id, permission_id) where status = 'active' do nothing;

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
  'Sprint 2A Finance responsibility grant'
from public.roles
cross join public.permissions
where roles.role_key = 'finance'
  and permissions.permission_key in (
    'catalog.city.read',
    'catalog.service.read',
    'customer.address.read',
    'lead.record.read',
    'document.attachment.read',
    'quotation.record.read',
    'quotation.record.manage',
    'quotation.record.approve',
    'order.record.read'
  )
on conflict (role_id, permission_id) where status = 'active' do nothing;

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
  'Sprint 2A Customer Service responsibility grant'
from public.roles
cross join public.permissions
where roles.role_key = 'customer_service'
  and permissions.permission_key in (
    'catalog.city.read',
    'catalog.service.read',
    'customer.address.read',
    'lead.record.read',
    'document.attachment.read',
    'quotation.record.read',
    'order.record.read'
  )
on conflict (role_id, permission_id) where status = 'active' do nothing;

create policy rls_cities__select__public_active
on public.cities
for select
to anon
using (status = 'active' and deleted_at is null);

create policy rls_cities__select__active_or_staff_reader
on public.cities
for select
to authenticated
using (
  (status = 'active' and deleted_at is null)
  or (select public.has_permission('catalog.city.read'))
  or (select public.has_permission('catalog.city.manage'))
);

create policy rls_cities__insert__catalog_manager
on public.cities
for insert
to authenticated
with check ((select public.has_permission('catalog.city.manage')));

create policy rls_cities__update__catalog_manager
on public.cities
for update
to authenticated
using ((select public.has_permission('catalog.city.manage')))
with check ((select public.has_permission('catalog.city.manage')));

create policy rls_services__select__public_active
on public.services
for select
to anon
using (status = 'active' and deleted_at is null);

create policy rls_services__select__active_or_staff_reader
on public.services
for select
to authenticated
using (
  (status = 'active' and deleted_at is null)
  or (select public.has_permission('catalog.service.read'))
  or (select public.has_permission('catalog.service.manage'))
);

create policy rls_services__insert__catalog_manager
on public.services
for insert
to authenticated
with check ((select public.has_permission('catalog.service.manage')));

create policy rls_services__update__catalog_manager
on public.services
for update
to authenticated
using ((select public.has_permission('catalog.service.manage')))
with check ((select public.has_permission('catalog.service.manage')));

create policy rls_service_options__select__public_active
on public.service_options
for select
to anon
using (status = 'active' and deleted_at is null);

create policy rls_service_options__select__active_or_staff_reader
on public.service_options
for select
to authenticated
using (
  (status = 'active' and deleted_at is null)
  or (select public.has_permission('catalog.service.read'))
  or (select public.has_permission('catalog.service.manage'))
);

create policy rls_service_options__insert__catalog_manager
on public.service_options
for insert
to authenticated
with check ((select public.has_permission('catalog.service.manage')));

create policy rls_service_options__update__catalog_manager
on public.service_options
for update
to authenticated
using ((select public.has_permission('catalog.service.manage')))
with check ((select public.has_permission('catalog.service.manage')));

create policy rls_addresses__insert__guest_submission
on public.addresses
for insert
to anon
with check (
  profile_id is null
  and created_by_profile_id is null
  and updated_by_profile_id is null
  and deleted_at is null
);

create policy rls_addresses__select__owner_or_staff
on public.addresses
for select
to authenticated
using (
  profile_id = (select public.current_profile_id())
  or (select public.has_permission('customer.address.read'))
  or (select public.has_permission('customer.address.manage'))
);

create policy rls_addresses__insert__owner_or_staff
on public.addresses
for insert
to authenticated
with check (
  (
    profile_id = (select public.current_profile_id())
    and created_by_profile_id = (select public.current_profile_id())
  )
  or (select public.has_permission('customer.address.manage'))
);

create policy rls_addresses__update__owner_or_staff
on public.addresses
for update
to authenticated
using (
  profile_id = (select public.current_profile_id())
  or (select public.has_permission('customer.address.manage'))
)
with check (
  profile_id = (select public.current_profile_id())
  or (select public.has_permission('customer.address.manage'))
);

create policy rls_leads__insert__guest_submission
on public.leads
for insert
to anon
with check (
  profile_id is null
  and status = 'new'
  and source = 'web'
  and created_by_profile_id is null
  and updated_by_profile_id is null
  and internal_notes is null
);

create policy rls_leads__select__owner_or_staff
on public.leads
for select
to authenticated
using (
  profile_id = (select public.current_profile_id())
  or (select public.has_permission('lead.record.read'))
  or (select public.has_permission('lead.record.manage'))
);

create policy rls_leads__insert__owner_or_staff
on public.leads
for insert
to authenticated
with check (
  (
    profile_id = (select public.current_profile_id())
    and created_by_profile_id = (select public.current_profile_id())
    and status = 'new'
    and internal_notes is null
  )
  or (
    (select public.has_permission('lead.record.manage'))
    and status = 'new'
  )
);

create policy rls_leads__update__staff_manager
on public.leads
for update
to authenticated
using ((select public.has_permission('lead.record.manage')))
with check ((select public.has_permission('lead.record.manage')));

create policy rls_lead_attachments__select__owner_or_staff
on public.lead_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.leads
    where leads.id = lead_attachments.lead_id
      and leads.profile_id = (select public.current_profile_id())
  )
  or (select public.has_permission('document.attachment.read'))
  or (select public.has_permission('document.attachment.manage'))
);

create policy rls_lead_attachments__insert__staff_manager
on public.lead_attachments
for insert
to authenticated
with check ((select public.has_permission('document.attachment.manage')));

create policy rls_lead_attachments__update__staff_manager
on public.lead_attachments
for update
to authenticated
using ((select public.has_permission('document.attachment.manage')))
with check ((select public.has_permission('document.attachment.manage')));

create policy rls_quotations__select__owner_or_staff
on public.quotations
for select
to authenticated
using (
  exists (
    select 1
    from public.leads
    where leads.id = quotations.lead_id
      and leads.profile_id = (select public.current_profile_id())
  )
  or (select public.has_permission('quotation.record.read'))
  or (select public.has_permission('quotation.record.manage'))
);

create policy rls_quotations__insert__staff_manager
on public.quotations
for insert
to authenticated
with check (
  (select public.has_permission('quotation.record.manage'))
  and status = 'draft'
);

create policy rls_quotations__update__staff_manager
on public.quotations
for update
to authenticated
using ((select public.has_permission('quotation.record.manage')))
with check ((select public.has_permission('quotation.record.manage')));

create policy rls_orders__select__owner_or_staff
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.quotations
    join public.leads on leads.id = quotations.lead_id
    where quotations.id = orders.quotation_id
      and leads.profile_id = (select public.current_profile_id())
  )
  or (select public.has_permission('order.record.read'))
  or (select public.has_permission('order.record.manage'))
);

create policy rls_orders__insert__staff_manager
on public.orders
for insert
to authenticated
with check (
  (select public.has_permission('order.record.manage'))
  and execution_status = 'created'
);

create policy rls_orders__update__staff_manager
on public.orders
for update
to authenticated
using ((select public.has_permission('order.record.manage')))
with check ((select public.has_permission('order.record.manage')));

revoke all on table public.cities from public, anon, authenticated;
revoke all on table public.services from public, anon, authenticated;
revoke all on table public.service_options from public, anon, authenticated;
revoke all on table public.addresses from public, anon, authenticated;
revoke all on table public.leads from public, anon, authenticated;
revoke all on table public.lead_attachments from public, anon, authenticated;
revoke all on table public.quotations from public, anon, authenticated;
revoke all on table public.orders from public, anon, authenticated;

grant select on table public.cities to anon, authenticated;
grant select on table public.services to anon, authenticated;
grant select on table public.service_options to anon, authenticated;
grant insert on table public.addresses to anon;
grant insert on table public.leads to anon;

grant insert, update on table public.cities to authenticated;
grant insert, update on table public.services to authenticated;
grant insert, update on table public.service_options to authenticated;
grant select, insert, update on table public.addresses to authenticated;
grant select, insert, update on table public.leads to authenticated;
grant select, insert, update on table public.lead_attachments to authenticated;
grant select, insert, update on table public.quotations to authenticated;
grant select, insert, update on table public.orders to authenticated;

grant all on table public.cities to service_role;
grant all on table public.services to service_role;
grant all on table public.service_options to service_role;
grant all on table public.addresses to service_role;
grant all on table public.leads to service_role;
grant all on table public.lead_attachments to service_role;
grant all on table public.quotations to service_role;
grant all on table public.orders to service_role;

revoke all on function private.set_business_audit_fields() from public, anon, authenticated;
revoke all on function private.protect_catalog_keys() from public, anon, authenticated;
revoke all on function private.protect_referenced_address() from public, anon, authenticated;
revoke all on function private.validate_lead_record() from public, anon, authenticated;
revoke all on function private.protect_attachment_record() from public, anon, authenticated;
revoke all on function private.validate_quotation_record() from public, anon, authenticated;
revoke all on function private.validate_order_record() from public, anon, authenticated;

commit;
