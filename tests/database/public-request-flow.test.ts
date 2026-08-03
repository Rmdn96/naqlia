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

describe("Sprint 3 public request database contract", () => {
  it("adds cargo, idempotency, and immutable consent provenance", () => {
    expect(migration).toContain("add column cargo_description text");
    expect(migration).toContain("add column cargo_quantity integer");
    expect(migration).toContain("add column submission_key uuid");
    expect(migration).toContain("uidx_leads__submission_key");
    expect(migration).toContain("privacy_consent_version");
    expect(migration).toContain("privacy_consented_at");
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
});
