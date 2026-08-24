import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260822090000_seo_local_seo_v1.sql"),
  "utf8",
);

describe("SEO and Local SEO migration", () => {
  it("uses normalized localized registry tables and unique URL constraints", () => {
    expect(sql).toContain("create table public.city_seo_contents");
    expect(sql).toContain("create table public.city_seo_faqs");
    expect(sql).toContain("create table public.city_seo_routes");
    expect(sql).toContain("unique(city_id,locale)");
    expect(sql).toContain("unique(locale,slug)");
    expect(sql).toContain("^[a-z0-9]+(?:-[a-z0-9]+)*$");
  });

  it("keeps operational status, publication, and indexability independent", () => {
    expect(sql).toContain("content_status text not null default 'draft'");
    expect(sql).toContain("is_indexable boolean not null default false");
    expect(sql).toContain("cardinality(private.city_seo_readiness_issues(s.id))=0");
    expect(sql).toContain("seo_indexability_disabled");
  });

  it("denies anonymous table access and exposes only narrow projections", () => {
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on table public.city_seo_contents");
    expect(sql).toContain("get_public_city_seo_content");
    expect(sql).toContain("get_indexable_city_seo_index");
    expect(sql).not.toMatch(/grant (select|insert|update|delete).*city_seo_.* to anon/i);
  });

  it("authorizes Super Admin management inside fixed-search-path functions", () => {
    expect(sql).toContain("private.require_portal_permission('settings.seo.manage')");
    expect(sql).toContain("private.require_portal_permission('settings.seo.read')");
    expect(sql.match(/security definer set search_path=''/g)?.length).toBeGreaterThanOrEqual(7);
    expect(sql).toContain("where r.role_key='super_admin'");
  });

  it("seeds only Riyadh as complete and leaves all other cities Draft", () => {
    expect(sql).toContain("insert into public.city_seo_contents(city_id,locale,slug)");
    expect(sql).toContain("c.city_code='RUH'");
    expect(sql).not.toContain("c.city_code='JED'");
  });
});
