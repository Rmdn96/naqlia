import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260814090000_reviews_quality_management.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(
    process.cwd(),
    "supabase/rollbacks/20260814090000_reviews_quality_management.rollback.sql",
  ),
  "utf8",
);
const customerFunction = migration.slice(
  migration.indexOf("function public.customer_upsert_job_review"),
  migration.indexOf("create or replace function public.quality_list_reviews"),
);

describe("Reviews and Quality Management database contract", () => {
  it("uses one verified Review per completed Job", () => {
    expect(migration).toContain("uq_job_reviews__job_id unique (job_id)");
    expect(migration).toContain("and j.status = 'completed'");
    expect(migration).toContain("constraint ck_job_reviews__verified check (is_verified)");
  });
  it("validates all rating and comment fields in PostgreSQL", () => {
    expect(migration).toContain("overall_rating between 1 and 5");
    expect(migration).toContain("punctuality_rating between 1 and 5");
    expect(migration).toContain("handling_rating between 1 and 5");
    expect(migration).toContain("char_length(comment) between 1 and 2000");
  });
  it("scopes customer access to an active unexpired hashed Tracking capability", () => {
    expect(migration).toContain("extensions.digest(p_token, 'sha256')");
    expect(migration).toContain("a.status = 'active' and a.expires_at > now()");
    expect(migration).toContain("function public.customer_get_job_review(p_token text)");
    expect(migration).not.toMatch(
      /function public\.customer_(get|upsert)_job_review\([^)]*p_(job|lead)/i,
    );
  });
  it("allows only Drivers from delivered Trips belonging to the same Job", () => {
    expect(customerFunction).toContain(
      "t.job_id = v_context.job_id and t.driver_id = v_driver and t.status = 'delivered'",
    );
    expect(migration).toContain(
      "uq_review_driver_ratings__review_driver unique (review_id, driver_id)",
    );
  });
  it("supports multi-Driver independent ratings and rejects duplicates", () => {
    expect(customerFunction).toContain("jsonb_array_elements(p_driver_ratings)");
    expect(customerFunction).toContain("count(distinct (value->>'driver_id'))");
    expect(customerFunction).toContain("p_driver_ratings) > 50");
  });
  it("defaults Reviews to private and requires consent for publication and featuring", () => {
    expect(migration).toContain("publication_status text not null default 'private'");
    expect(migration).toContain("publication_status <> 'published' or publication_consent");
    expect(migration).toContain(
      "not is_featured or (publication_status = 'published' and publication_consent)",
    );
  });
  it("prevents customers from controlling verified, publication, or featured fields", () => {
    expect(customerFunction).not.toMatch(/p_(is_)?verified/);
    expect(customerFunction).not.toMatch(/p_(publication_status|is_featured)/);
    expect(migration).toContain("quality.publication.manage");
  });
  it("returns material edits of Published Reviews to Pending Publication", () => {
    expect(customerFunction).toContain(
      "v_material_change and v_existing.publication_status = 'published' then 'pending_publication'",
    );
    expect(customerFunction).toContain("public.review_driver_ratings rr");
  });
  it("withdraws consent immediately and removes featured eligibility", () => {
    expect(customerFunction).toContain(
      "not p_publication_consent and v_existing.publication_status in ('published','pending_publication') then 'unpublished'",
    );
    expect(customerFunction).toContain(
      "is_featured=case when v_new_status='published' and p_publication_consent then is_featured else false end",
    );
  });
  it("creates exactly one durable low-rating Quality Alert", () => {
    expect(migration).toContain("uq_quality_alerts__job_id unique (job_id)");
    expect(customerFunction).toContain("if p_overall_rating <= 2 then");
    expect(customerFunction).toContain("on conflict(job_id) do nothing");
    expect(customerFunction).not.toMatch(/delete from public\.quality_alerts/);
  });
  it("does not auto-resolve a low-to-high Quality Alert", () => {
    expect(customerFunction).not.toMatch(/update public\.quality_alerts set status='resolved'/);
    expect(migration).toContain("quality_update_alert");
  });
  it("protects internal notes and resolution through Quality Alert permission", () => {
    expect(migration).toContain("quality.alert.manage");
    expect(migration).toContain("rls_quality_alert_notes__select__quality_manager");
    expect(migration).toContain(
      "v_can_alert := private.has_permission_authoritative('quality.alert.manage')",
    );
  });
  it("gives Super Admin full management, Customer Service alerts, and Operations read", () => {
    expect(migration).toContain("r.role_key = 'super_admin'");
    expect(migration).toContain(
      "r.role_key = 'customer_service' and p.permission_key in ('quality.workspace.read','quality.alert.manage')",
    );
    expect(migration).toContain(
      "r.role_key = 'operations' and p.permission_key = 'quality.workspace.read'",
    );
    expect(migration).not.toMatch(/r\.role_key\s*=\s*'(sales|finance)'[^;]+quality/);
  });
  it("allows anonymous callers only through two capability-scoped Review RPCs", () => {
    expect(migration).toContain(
      "grant execute on function public.customer_get_job_review(text),public.customer_upsert_job_review(text,integer,integer,integer,text,boolean,jsonb) to anon,authenticated",
    );
    expect(migration).toContain(
      "revoke all on table public.job_reviews,public.review_driver_ratings,public.quality_alerts,public.quality_alert_notes from public,anon,authenticated",
    );
    expect(migration).not.toMatch(/grant (select|insert|update|delete)[^;]+to anon/);
  });
  it("serializes simultaneous first submissions and updates", () => {
    expect(customerFunction).toContain("pg_advisory_xact_lock");
    expect(customerFunction).toContain("for update");
    expect(migration).toContain("version=version+1");
  });
  it("keeps Quality Alert creation race-safe", () => {
    expect(migration).toContain("uq_quality_alerts__review_id unique (review_id)");
    expect(customerFunction).toContain("on conflict(job_id) do nothing returning id into v_alert");
  });
  it("uses fixed search paths and internal authorization on all privileged functions", () => {
    for (const name of [
      "customer_get_job_review",
      "customer_upsert_job_review",
      "quality_list_reviews",
      "quality_get_review",
      "quality_set_review_publication",
      "quality_update_alert",
    ]) {
      const start = migration.indexOf(`function public.${name}`);
      const body = migration.slice(start, migration.indexOf("$$;", start) + 3);
      expect(body).toContain("security definer");
      expect(body).toContain("set search_path=''");
    }
    expect(migration).toContain("private.require_quality_permission('quality.workspace.read')");
  });
  it("records meaningful events without comments or capabilities", () => {
    for (const event of [
      "review_submitted",
      "review_updated",
      "publication_consent_changed",
      "quality_alert_created",
      "review_publication_approved",
      "review_unpublished",
      "review_featured",
      "review_unfeatured",
      "quality_alert_resolved",
    ])
      expect(migration).toContain(`'${event}'`);
    expect(customerFunction).not.toMatch(/write_operation_activity[^;]*(p_token|v_comment)/);
  });
  it("keeps direct customer identifiers out of future publication controls", () => {
    const publication = migration.slice(
      migration.indexOf("function public.quality_set_review_publication"),
      migration.indexOf("function public.quality_update_alert"),
    );
    expect(publication).not.toMatch(
      /customer_name|mobile_number|formatted_address|reference_number/,
    );
  });
  it("provides a transactional data-preserving rollback", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);
    expect(rollback).toContain("Rollback refused: Reviews exist");
    expect(rollback).toContain("drop table if exists public.job_reviews");
  });
});
