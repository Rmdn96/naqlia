begin;

-- This rollback is intentionally fail-closed once a customer capability has
-- been issued. Removing a response boundary after commercial use would erase
-- security/audit evidence and is not considered safe.
do $$
begin
  if exists (select 1 from public.quotation_customer_accesses) then
    raise exception 'Rollback refused: customer quotation access records exist';
  end if;
end;
$$;

revoke all on function public.customer_respond_to_quotation(text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.customer_get_quotation(text)
  from public, anon, authenticated, service_role;
revoke all on function public.sales_reissue_quotation_access(uuid)
  from public, anon, authenticated, service_role;

drop function public.customer_respond_to_quotation(text, text, text, text);
drop function public.customer_get_quotation(text);
drop function private.customer_quotation_payload(uuid, text);
drop function public.sales_reissue_quotation_access(uuid);
drop function private.issue_quotation_customer_access(uuid, uuid);
drop function private.revoke_quotation_customer_accesses(uuid, text, uuid);
drop table public.quotation_customer_accesses;

alter table public.lead_activity_logs drop constraint ck_lead_activity_logs__event_key;
alter table public.lead_activity_logs
  add constraint ck_lead_activity_logs__event_key check (
    event_key in (
      'lead_created', 'lead_viewed', 'lead_qualified', 'lead_quoted', 'lead_order_ready',
      'lead_closed', 'lead_cancelled', 'quotation_draft_created', 'quotation_draft_updated',
      'quotation_sent', 'quotation_approved', 'quotation_rejected', 'quotation_expired',
      'quotation_superseded', 'quotation_cancelled'
    )
  );

drop index public.idx_quotations__superseded_by_quotation_id;
alter table public.quotations drop constraint ck_quotations__approved_state;
alter table public.quotations drop constraint ck_quotations__superseded_state;
alter table public.quotations drop constraint ck_quotations__rejected_state;
alter table public.quotations drop constraint ck_quotations__rejection_reason_text;
alter table public.quotations drop constraint ck_quotations__rejection_reason_code;
alter table public.quotations drop constraint fk_quotations__superseded_by_quotation_id__quotations;
alter table public.quotations
  drop column superseded_by_quotation_id,
  drop column rejection_reason_text,
  drop column rejection_reason_code,
  drop column rejected_at,
  add constraint ck_quotations__approved_state check (
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
    if new.id <> old.id or new.quotation_number <> old.quotation_number
      or new.lead_id <> old.lead_id or new.revision_number <> old.revision_number
    then
      raise exception using errcode = '23514', message = 'Quotation identity is immutable';
    end if;
    if old.status <> 'draft' and (
      new.currency <> old.currency or new.subtotal_amount <> old.subtotal_amount
      or new.tax_amount <> old.tax_amount or new.quoted_amount <> old.quoted_amount
      or new.vat_rate <> old.vat_rate or new.expires_at <> old.expires_at
      or new.terms_ar <> old.terms_ar or new.terms_en <> old.terms_en
    ) then
      raise exception using errcode = '23514', message = 'Issued Quotation commercial terms are immutable';
    end if;
    if new.status is distinct from old.status and not (
      (old.status = 'draft' and new.status in ('sent', 'cancelled'))
      or (old.status = 'sent' and new.status in ('approved', 'rejected', 'expired', 'superseded'))
    ) then
      raise exception using errcode = '23514', message = 'Unsupported Quotation status transition';
    end if;
  end if;
  if new.status not in ('draft', 'cancelled') and new.sent_at is null then new.sent_at := now(); end if;
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
  return new;
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
  update public.quotations set status = 'superseded'
  where lead_id = quotation_row.lead_id and status = 'sent';
  update public.quotations set status = 'sent'
  where id = quotation_row.id returning * into quotation_row;
  update public.leads set status = 'qualified'
  where id = quotation_row.lead_id and status = 'new';
  update public.leads set status = 'quoted'
  where id = quotation_row.lead_id and status = 'qualified';
  return jsonb_build_object(
    'id', quotation_row.id,
    'quotation_number', quotation_row.quotation_number,
    'revision_number', quotation_row.revision_number,
    'status', quotation_row.status,
    'sent_at', quotation_row.sent_at
  );
end;
$$;

revoke all on function private.validate_quotation_record() from public, anon, authenticated, service_role;
revoke all on function public.sales_send_quotation(uuid) from public, anon, authenticated;
grant execute on function public.sales_send_quotation(uuid) to authenticated;

commit;
