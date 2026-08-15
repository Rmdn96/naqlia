begin;

-- Guest records keep their immutable submission identity. Verified account ownership
-- is represented exclusively by customer_account_leads after a capability claim.
create or replace function private.link_customer_lead(
  p_account uuid,
  p_lead uuid,
  p_method text,
  p_source uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing uuid;
  v_profile uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('account-lead:' || p_lead::text, 0)
  );

  select customer_account_id
  into v_existing
  from public.customer_account_leads
  where lead_id = p_lead
  for update;

  if v_existing = p_account then
    return 'linked';
  end if;

  if v_existing is not null then
    return 'invalid';
  end if;

  select profile_id
  into v_profile
  from public.customer_accounts
  where id = p_account;

  if v_profile is null or not exists (select 1 from public.leads where id = p_lead) then
    return 'invalid';
  end if;

  insert into public.customer_account_leads (
    customer_account_id,
    lead_id,
    claim_method,
    capability_source_id,
    claimed_by_profile_id
  )
  values (p_account, p_lead, p_method, p_source, v_profile);

  insert into public.lead_activity_logs (
    lead_id,
    event_key,
    actor_profile_id,
    details,
    occurred_at,
    functional_area
  )
  values (
    p_lead,
    'customer_account_linked',
    v_profile,
    pg_catalog.jsonb_build_object('claim_method', p_method),
    pg_catalog.now(),
    'account'
  );

  return 'linked';
end;
$$;

revoke all on function private.link_customer_lead(uuid, uuid, text, uuid)
from public, anon, authenticated;

comment on function private.link_customer_lead(uuid, uuid, text, uuid) is
  'Concurrency-safe verified capability ownership linkage. Guest Lead identity remains immutable; retries are idempotent and cross-account claims fail generically.';

commit;
