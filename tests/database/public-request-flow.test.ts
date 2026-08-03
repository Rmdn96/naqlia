import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260803170000_public_request_flow.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(process.cwd(), "supabase/rollbacks/20260803170000_public_request_flow.rollback.sql"),
  "utf8",
);
const arabicCatalogRepair = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260803170500_public_request_repair_arabic_catalog.sql",
  ),
  "utf8",
);
const referenceMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260803171000_standardize_lead_references.sql"),
  "utf8",
);

describe("Sprint 3 public request database contract", () => {
  it("adds cargo, idempotency, and immutable consent provenance", () => {
    expect(migration).toContain("add column cargo_description text");
    expect(migration).toContain("add column cargo_quantity integer");
    expect(migration).toContain("add column submission_key uuid");
    expect(migration).toContain("uidx_leads__submission_key");
    expect(migration).toContain("privacy_consent_version");
    expect(migration).toContain("privacy_consented_at");
  });

  it("allocates unique sequential public references per Riyadh calendar month", () => {
    expect(referenceMigration.trimStart()).toMatch(/^begin;/);
    expect(referenceMigration.trimEnd()).toMatch(/commit;$/);
    expect(referenceMigration).toContain("create table public.lead_reference_counters");
    expect(referenceMigration).toContain("on conflict (reference_month) do update");
    expect(referenceMigration).toContain("last_sequence = counters.last_sequence + 1");
    expect(referenceMigration).toContain("timezone('Asia/Riyadh', clock_timestamp())");
    expect(referenceMigration).toContain("'NQ-' || to_char(reference_month, 'YYYYMM')");
    expect(referenceMigration).toContain("lpad(next_sequence::text, 6, '0')");
    expect(referenceMigration).toContain("uq_leads__reference_number");
    expect(referenceMigration).toContain("'^NQ-[0-9]{6}-[0-9]{6}$'");
    expect(referenceMigration).toContain("trg_leads__before_insert__assign_public_reference");
  });

  it("uses one service-role-only transactional submission boundary", () => {
    expect(migration).toContain("public.submit_guest_service_request");
    expect(migration).toContain("if auth.role() is distinct from 'service_role'");
    expect(migration).toContain("grant execute on function public.submit_guest_service_request");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("pg_catalog.pg_advisory_xact_lock");
    expect(migration).toContain("revoke all on function public.submit_guest_service_request");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("drop policy rls_addresses__insert__guest_submission");
    expect(migration).toContain("drop policy rls_leads__insert__guest_submission");
    expect(migration).toContain("revoke insert on table public.addresses from anon");
    expect(migration).toContain("revoke insert on table public.leads from anon");
  });

  it("persists storage metadata without granting bucket access", () => {
    expect(migration).toContain("insert into public.lead_attachments");
    expect(migration).toContain("'attachments'");
    expect(migration).toContain("'pending'");
    expect(migration).not.toContain("create policy");
    expect(migration).not.toContain("storage.objects");
  });

  it("provides a transactional reverse migration", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);
    expect(rollback).toContain("drop function public.submit_guest_service_request");
    expect(rollback).toContain("drop column cargo_description");
    expect(rollback).toContain("create policy rls_addresses__insert__guest_submission");
    expect(rollback).toContain("create policy rls_leads__insert__guest_submission");
  });

  it("repairs the inherited Arabic catalog encoding without changing stable keys", () => {
    expect(arabicCatalogRepair.trimStart()).toMatch(/^begin;/);
    expect(arabicCatalogRepair.trimEnd()).toMatch(/commit;$/);
    expect(arabicCatalogRepair).toContain("'الرياض'");
    expect(arabicCatalogRepair).toContain("'نقل الأثاث'");
    expect(arabicCatalogRepair).toContain("'التحميل والتنزيل'");
    expect(arabicCatalogRepair).toContain("where cities.city_code");
    expect(arabicCatalogRepair).toContain("where services.service_key");
    expect(arabicCatalogRepair).toContain("where service_options.option_key");
    expect(arabicCatalogRepair).not.toContain("ط§");
  });
});
