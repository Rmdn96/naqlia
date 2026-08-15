import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260815100000_unified_account_dashboard.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(
    process.cwd(),
    "supabase/rollbacks/20260815100000_unified_account_dashboard.rollback.sql",
  ),
  "utf8",
);

function functionBody(name: string) {
  const start = migration.indexOf(`function public.${name}`);
  return migration.slice(start, migration.indexOf("$$;", start) + 3);
}

describe("Unified Account and Staff Dashboard database contract", () => {
  it("keeps Customer context separate from the authoritative staff role assignment", () => {
    expect(migration).toContain("create table public.customer_accounts");
    expect(migration).toContain("constraint uq_customer_accounts__profile unique(profile_id)");
    expect(migration).toContain("staff_access_status text not null default 'not_staff'");
    expect(migration).toContain(
      "insert into public.customer_accounts(profile_id,preferred_locale)",
    );
    expect(functionBody("admin_set_staff_role")).toContain(
      "set profile_kind='staff',status='suspended'",
    );
  });

  it("never derives staff authorization from public Auth metadata", () => {
    const resolver = functionBody("resolve_identity_context");
    expect(resolver).not.toMatch(/user_metadata[^;]*(role|permission)/i);
    expect(resolver).toContain("from public.profile_roles");
    expect(resolver).toContain("v_profile.staff_access_status='active'");
  });

  it("requires a secure existing capability for historical Guest claiming", () => {
    const claim = functionBody("account_claim_request");
    expect(claim).toContain("p_capability_type not in ('quotation','tracking')");
    expect(claim).toContain("p_token!~'^[a-f0-9]{64}$'");
    expect(claim).toContain("extensions.digest(p_token,'sha256')");
    expect(claim).not.toMatch(/p_(reference|mobile|email|lead|job)/);
  });

  it("makes ownership links unique, serialized, and idempotent", () => {
    const link = migration.slice(
      migration.indexOf("function private.link_customer_lead"),
      migration.indexOf("create or replace function public.account_claim_request"),
    );
    expect(migration).toContain("constraint uq_customer_account_leads__lead unique(lead_id)");
    expect(link).toContain("pg_advisory_xact_lock");
    expect(link).toContain("on conflict(lead_id) do nothing");
    expect(link).toContain("v_existing<>p_account then return 'invalid'");
  });

  it("supports same-session authenticated submissions without changing Guest submission", () => {
    expect(functionBody("account_link_submission")).toContain("submission_key=p_submission_key");
    expect(functionBody("account_link_submission")).toContain("source='web'");
    expect(migration).toContain("'authenticated_submission'");
  });

  it("issues tracking access only after Customer Account ownership validation", () => {
    const issue = functionBody("account_issue_job_tracking_access");
    expect(issue).toContain("cl.customer_account_id=v_account and j.id=p_job");
    expect(issue).toContain("private.issue_job_tracking_access(p_job,v_profile)");
    expect(issue).not.toContain("token_hash");
  });

  it("provides role-specific Dashboard metrics without invented accounting records", () => {
    const dashboard = functionBody("portal_get_dashboard");
    for (const role of ["sales", "operations", "customer_service", "finance", "super_admin"]) {
      expect(dashboard).toContain(`'${role}'`);
    }
    expect(dashboard).toContain("accepted_order_value");
    expect(dashboard).not.toMatch(/ledger|journal|receivable|payable|payment_reconciliation/i);
  });

  it("limits Global Search to normalized NQ references and permission-filtered branches", () => {
    const search = functionBody("portal_global_search");
    expect(search).toContain("'^NQ-[0-9]{6}-[0-9]{6}$'");
    expect(search).toContain("private.has_permission_authoritative('sales.workspace.read')");
    expect(search).toContain("private.has_permission_authoritative('operations.workspace.read')");
    expect(search).toContain("private.has_permission_authoritative('quality.workspace.read')");
    expect(search).toContain("private.has_permission_authoritative('finance.dashboard.read')");
  });

  it("derives notifications from visible activity and materializes only read state", () => {
    expect(migration).toContain("create table public.staff_notification_reads");
    expect(migration).not.toMatch(/create table public\.(staff_)?notifications\s*\(/);
    expect(functionBody("portal_list_notifications")).toContain("private.portal_activity_visible");
    expect(functionBody("portal_mark_notifications_read")).toContain("on conflict do nothing");
  });

  it("allows only allowlisted non-secret Business Settings", () => {
    expect(migration).toContain("create table public.business_settings");
    expect(migration).toContain("Unsupported business setting");
    expect(migration).not.toMatch(
      /setting_key[^\n]*(service_role|secret|password|database_url|oauth_secret)/i,
    );
    expect(functionBody("get_public_business_settings")).toContain("where is_public");
  });

  it("preserves the official WhatsApp value and configurable Google Review boundary", () => {
    expect(migration).toContain("('contact.whatsapp','contact','966547349947',true)");
    expect(migration).toContain("('customer.google_review_url','customer',null,true)");
  });

  it("reuses Cities as ordered active/inactive Service Areas", () => {
    expect(functionBody("admin_update_service_area")).toContain("update public.cities");
    expect(functionBody("admin_update_service_area")).toContain(
      "p_status not in ('active','inactive')",
    );
    expect(migration).not.toMatch(/create table public\.service_areas/);
  });

  it("protects the last active Super Admin under concurrent changes", () => {
    expect(functionBody("admin_set_staff_role")).toContain("pg_advisory_xact_lock");
    expect(functionBody("admin_set_staff_access")).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("The last active Super Admin cannot change role");
    expect(migration).toContain("The last active Super Admin cannot be deactivated");
    expect(migration).toContain("trg_profiles__before_update__protect_staff_access");
  });

  it("keeps audit records read-only and strips sensitive generic details", () => {
    expect(functionBody("admin_list_activity")).toContain(
      "a.details-'reason'-'internal_reason'-'note'-'comment'",
    );
    const auditWriter = migration.slice(
      migration.indexOf("function private.write_platform_activity"),
      migration.indexOf("create or replace function private.has_permission_authoritative"),
    );
    expect(auditWriter).toContain("token|password|secret|session|magic.?link");
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[^;]*lead_activity_logs[^;]*authenticated/i,
    );
  });

  it("keeps all new public SECURITY DEFINER functions on a fixed search path", () => {
    for (const name of [
      "resolve_identity_context",
      "account_update_profile",
      "account_claim_request",
      "account_link_submission",
      "account_get_dashboard",
      "account_get_job_tracking",
      "account_issue_job_tracking_access",
      "get_public_business_settings",
      "portal_get_context",
      "portal_get_dashboard",
      "portal_global_search",
      "portal_list_notifications",
      "portal_mark_notifications_read",
      "admin_update_business_setting",
      "admin_update_service_area",
      "admin_set_staff_role",
      "admin_set_staff_access",
      "admin_register_staff_invitation",
    ]) {
      expect(functionBody(name)).toContain("security definer");
      expect(functionBody(name)).toContain("set search_path=''");
    }
  });

  it("grants no anonymous account, Portal, settings, or administration execution", () => {
    expect(migration).toContain(
      "grant execute on function public.get_public_business_settings() to anon",
    );
    expect(migration).not.toMatch(
      /grant execute on function public\.(account_|portal_|admin_)[^;]*to anon/,
    );
    expect(migration).not.toMatch(
      /grant (select|insert|update|delete)[^;]*(customer_accounts|staff_invitations|business_settings)[^;]*to anon/,
    );
  });

  it("adds indexes for ownership, notifications, audit filters, and invitations", () => {
    for (const index of [
      "idx_customer_account_leads__account_claimed",
      "idx_staff_notification_reads__activity",
      "idx_lead_activity_logs__area_occurred",
      "idx_lead_activity_logs__actor_occurred",
      "idx_lead_activity_logs__event_occurred",
      "idx_business_settings__category",
      "idx_staff_invitations__status_sent",
      "idx_staff_invitations__auth_user_sent",
    ])
      expect(migration).toContain(index);
  });

  it("provides a transactional, data-protecting rollback that restores replaced contracts", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);
    expect(rollback).toContain("Rollback refused: unified account or Staff Portal data exists");
    expect(rollback).toContain("alter column lead_id set not null");
    expect(rollback).toContain("create or replace function private.has_permission_authoritative");
    expect(rollback).toContain("create or replace function public.provision_staff_identity");
  });
});
