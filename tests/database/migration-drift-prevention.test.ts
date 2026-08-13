import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const script = readFileSync(
  resolve(process.cwd(), "scripts/supabase/verify-migration-drift.mjs"),
  "utf8",
);
const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/production-migration-drift.yml"),
  "utf8",
);
const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "supabase/migration-checksums.json"), "utf8"),
) as {
  migrations: Array<{
    production_history_sha256: string;
    repository_sha256: string;
    version: string;
  }>;
};

describe("production migration drift prevention", () => {
  it("pins repository and production-history checksums for every migration", () => {
    expect(manifest.migrations).toHaveLength(12);

    for (const migration of manifest.migrations) {
      expect(migration.version).toMatch(/^\d{14}$/);
      expect(migration.repository_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(migration.production_history_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("fails for missing, unexpected, renamed, or changed target migrations", () => {
    expect(script).toContain("target database is missing migration");
    expect(script).toContain("target database contains unapproved migration");
    expect(script).toContain("name mismatch");
    expect(script).toContain("history checksum mismatch");
    expect(script).toContain("repository migrations do not match");
  });

  it("uses a secret direct URL without printing it", () => {
    expect(workflow).toContain("secrets.SUPABASE_PRODUCTION_DB_URL");
    expect(script).toContain("process.env.SUPABASE_DB_URL");
    expect(script).not.toMatch(/console\.(log|error)\([^)]*databaseUrl/);
  });
});
