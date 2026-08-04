import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260804113000_reconcile_lead_reference_generation.sql",
  ),
  "utf8",
);
const rollback = readFileSync(
  resolve(
    process.cwd(),
    "supabase/rollbacks/20260804113000_reconcile_lead_reference_generation.rollback.sql",
  ),
  "utf8",
);

describe("production Lead reference reconciliation", () => {
  it("uses one unambiguous concurrency-safe monthly allocator", () => {
    expect(migration).toContain("current_reference_month date");
    expect(migration).toContain("on conflict on constraint pk_lead_reference_counters do update");
    expect(migration).toContain("counters.last_sequence + 1");
    expect(migration).toContain("timezone('Asia/Riyadh', clock_timestamp())");
    expect(migration).toContain("'NQ-' || to_char(current_reference_month, 'YYYYMM')");
    expect(migration).not.toContain("values (reference_month, 1)");
  });

  it("preserves the public-reference contract and removes legacy paths", () => {
    expect(migration).toContain("alter column reference_number drop default");
    expect(migration).toContain("'^NQ-[0-9]{6}-[0-9]{6}$'");
    expect(migration).toContain("uq_leads__reference_number");
    expect(migration).toContain("trg_leads__before_insert__assign_public_reference");
    expect(migration).toContain("like '%LD-%'");
  });

  it("keeps the allocator private and provides a safe forward-only rollback", () => {
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("from public, anon, authenticated, service_role");
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback).toContain("Automatic rollback is intentionally unavailable");
    expect(rollback.trimEnd()).toMatch(/rollback;$/);
  });

  it("does not change row-level security or applied migration history", () => {
    expect(migration).not.toMatch(/create\s+policy/i);
    expect(migration).not.toMatch(/drop\s+policy/i);
    expect(migration).not.toContain("supabase_migrations.schema_migrations");
  });
});
