begin;

revoke all on function public.sales_list_lead_inbox(integer, integer, text, text, uuid, uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.sales_get_lead_detail(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.sales_mark_lead_viewed(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.sales_save_quotation(uuid, uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.sales_send_quotation(uuid)
  from public, anon, authenticated, service_role;
drop function public.sales_send_quotation(uuid);
drop function public.sales_save_quotation(uuid, uuid, jsonb);
drop function public.sales_mark_lead_viewed(uuid);
drop function public.sales_get_lead_detail(uuid);
drop function public.sales_list_lead_inbox(integer, integer, text, text, uuid, uuid, text, text);

drop trigger trg_quotations__after_insert_update__activity on public.quotations;
drop trigger trg_leads__after_insert_update__activity on public.leads;
drop function private.record_quotation_activity();
drop function private.record_lead_activity();
drop function private.write_lead_activity(uuid, text, uuid, uuid, jsonb);
drop function private.require_sales_workspace_permission(text);

drop index public.idx_leads__sales_search;
drop table public.lead_workspace_views;
drop table public.lead_activity_logs;
drop table public.quotation_line_items;

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

alter table public.quotations
  drop constraint ck_quotations__vat_rate,
  drop column vat_rate;

delete from public.role_permissions
using public.permissions
where role_permissions.permission_id = permissions.id
  and permissions.permission_key in ('sales.workspace.read', 'sales.workspace.manage');

delete from public.permissions
where permission_key in ('sales.workspace.read', 'sales.workspace.manage');

commit;
