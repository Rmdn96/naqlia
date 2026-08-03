begin;

revoke all on function public.submit_guest_service_request(jsonb, jsonb)
  from public, anon, authenticated, service_role;
drop function public.submit_guest_service_request(jsonb, jsonb);

drop trigger trg_leads__before_insert_update__protect_request_provenance
  on public.leads;
drop function private.protect_public_request_provenance();

drop index public.uidx_leads__submission_key;

alter table public.leads
  drop constraint ck_leads__public_request_consent,
  drop constraint ck_leads__cargo_quantity,
  drop constraint ck_leads__cargo_description,
  drop column privacy_consented_at,
  drop column privacy_consent_version,
  drop column submission_key,
  drop column cargo_quantity,
  drop column cargo_description;

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

grant insert on table public.addresses to anon;
grant insert on table public.leads to anon;

commit;
