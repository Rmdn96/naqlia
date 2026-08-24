import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260803140500_identity_create_foundation.sql"),
  "utf8",
);
const storageMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260803142000_storage_create_foundation_buckets.sql",
  ),
  "utf8",
);

describe("identity foundation migration", () => {
  it("creates only the five approved identity tables", () => {
    const createdTables = [...migration.matchAll(/create table public\.(\w+)/g)].map(
      ([, table]) => table,
    );

    expect(createdTables).toEqual([
      "profiles",
      "roles",
      "permissions",
      "role_permissions",
      "profile_roles",
    ]);
  });

  it("enables RLS for every identity table and grants nothing to guests", () => {
    expect(migration.match(/enable row level security/g)).toHaveLength(5);
    expect(migration).not.toMatch(/grant\s+(?:select|insert|update|delete|all).*\s+to\s+anon/i);
  });

  it("keeps authorization database-authoritative and business-permission free", () => {
    expect(migration).toContain("public.has_permission(requested_permission text)");
    expect(migration).toContain("profiles.auth_user_id = auth.uid()");
    expect(migration).not.toMatch(/'(?:lead|order|quotation|customer)\./);
  });

  it("defines both storage buckets with an idempotent upsert", () => {
    expect(storageMigration).toContain("'attachments'");
    expect(storageMigration).toContain("'public-assets'");
    expect(storageMigration).toContain("on conflict (id) do update");
  });
});
