import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260822210000_seo_editorial_rollout_v1.sql"),
  "utf8",
);

describe("SEO Editorial Rollout v1", () => {
  it("keeps the generated migration synchronized with 42 validated locale records", () => {
    const output = execFileSync(
      process.execPath,
      ["scripts/seo/generate-editorial-rollout-v1.mjs", "--check"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(output).toContain("42 locale records valid");
  });

  it("refuses to overwrite operator-managed content", () => {
    expect(migration).toContain(
      "SEO editorial rollout refuses to overwrite operator-managed content",
    );
    expect(migration).toContain("s.updated_by_profile_id is not null");
    expect(migration).toContain("exists(select 1 from public.city_seo_faqs");
    expect(migration).toContain("exists(select 1 from public.city_seo_routes");
  });

  it("uses the approved readiness validator before publication and indexing", () => {
    const readinessCheck = migration.indexOf("SEO editorial readiness failed");
    const publication = migration.indexOf("content_status='published'");
    expect(readinessCheck).toBeGreaterThan(0);
    expect(publication).toBeGreaterThan(readinessCheck);
    expect(migration).toContain("private.city_seo_readiness_issues");
    expect(migration).toContain("is_indexable=true");
  });

  it("keeps the existing architecture and adds no public write boundary", () => {
    expect(migration).not.toMatch(/create\s+table/iu);
    expect(migration).not.toMatch(/create\s+(or\s+replace\s+)?function/iu);
    expect(migration).not.toMatch(/grant\s+.*\s+to\s+(anon|authenticated)/iu);
    expect(migration).not.toContain("city_seo_routes(");
  });

  it("requires all active localized records to remain readiness-valid after rollout", () => {
    expect(migration).toContain("<> 44");
    expect(migration).toContain("44 readiness-valid published locale records");
  });
});
