import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const readSql = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const schemaMigration = readSql(
  "supabase/migrations/20260803153000_core_business_create_schema.sql",
);
const securityMigration = readSql(
  "supabase/migrations/20260803154000_core_business_apply_security.sql",
);
const hardeningMigration = readSql(
  "supabase/migrations/20260803154500_identity_harden_authorization_boundary.sql",
);
const seedMigration = readSql(
  "supabase/migrations/20260803155000_core_business_seed_reference_data.sql",
);
const rollback = readSql("supabase/rollbacks/20260803155000_core_business_database.rollback.sql");

const businessTables = [
  "cities",
  "services",
  "service_options",
  "addresses",
  "leads",
  "lead_attachments",
  "quotations",
  "orders",
];

describe("Sprint 2A core business database", () => {
  it("creates exactly the eight approved business tables with RLS", () => {
    const createdTables = [...schemaMigration.matchAll(/create table public\.(\w+)/g)].map(
      ([, table]) => table,
    );

    expect(createdTables).toEqual(businessTables);
    expect(schemaMigration.match(/enable row level security/g)).toHaveLength(8);
    expect(securityMigration.match(/create policy /g)).toHaveLength(29);
  });

  it("defines production integrity and search structures", () => {
    expect(schemaMigration.match(/foreign key \(/g)).toHaveLength(32);
    expect(schemaMigration.match(/constraint ck_/g)).toHaveLength(75);
    expect(schemaMigration.match(/create (?:unique )?index /g)).toHaveLength(53);
    expect(schemaMigration).toContain("Orders require an approved, unexpired Quotation");
    expect(schemaMigration).toContain("uidx_quotations__approved_lead");
    expect(schemaMigration).toContain("uq_orders__quotation_id unique (quotation_id)");
  });

  it("preserves guest-first intake without granting direct tracking reads", () => {
    expect(securityMigration).toContain("rls_addresses__insert__guest_submission");
    expect(securityMigration).toContain("rls_leads__insert__guest_submission");
    expect(securityMigration).toContain("grant insert on table public.addresses to anon");
    expect(securityMigration).toContain("grant insert on table public.leads to anon");
    expect(securityMigration).not.toMatch(
      /grant select on table public\.(?:addresses|leads|lead_attachments|quotations|orders) to anon/,
    );
  });

  it("stores attachment metadata without coupling to Storage internals", () => {
    expect(schemaMigration).toContain("storage_bucket text not null default 'attachments'");
    expect(schemaMigration).toContain("storage_path text not null");
    expect(schemaMigration).toContain("size_bytes bigint not null");
    expect(schemaMigration).not.toMatch(/references storage\.objects/i);
  });

  it("seeds the approved launch catalogs only", () => {
    expect(seedMigration.match(/^\s*\('[A-Z]{3}',\s*'/gm)).toHaveLength(22);
    expect(seedMigration).toContain("'furniture_moving'");
    expect(seedMigration).toContain("'general_cargo_transport'");
    expect(seedMigration).toContain("'local_transport'");
    expect(seedMigration).toContain("'intercity_transport'");
    expect(seedMigration).toContain("'packing'");
    expect(seedMigration).toContain("'loading_unloading'");
  });

  it("keeps authoritative authorization private and public checks invoker-safe", () => {
    expect(hardeningMigration).toContain("private.has_permission_authoritative");
    expect(hardeningMigration).toMatch(
      /create or replace function public\.has_permission[\s\S]*?security invoker/,
    );
    expect(hardeningMigration).toContain(
      "revoke execute on function public.assign_staff_role(uuid, text, text)",
    );
  });

  it("provides an explicit transactional rollback in reverse dependency order", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);

    const dropOrder = [...rollback.matchAll(/drop table public\.(\w+);/g)].map(
      ([, table]) => table,
    );

    expect(dropOrder).toEqual([
      "orders",
      "quotations",
      "lead_attachments",
      "leads",
      "addresses",
      "service_options",
      "services",
      "cities",
    ]);
  });
});
