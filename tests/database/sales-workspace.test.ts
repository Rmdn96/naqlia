import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260804090000_sales_workspace.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(process.cwd(), "supabase/rollbacks/20260804090000_sales_workspace.rollback.sql"),
  "utf8",
);

describe("Sprint 4 Sales workspace database contract", () => {
  it("adds a revision-safe, line-item Quotation model with an auditable VAT rate", () => {
    expect(migration).toContain("create table public.quotation_line_items");
    expect(migration).toContain("unique (quotation_id, line_number)");
    expect(migration).toContain("generated always as (round(quantity * unit_price, 2)) stored");
    expect(migration).toContain("add column vat_rate numeric(5, 4)");
    expect(migration).toContain("new.vat_rate <> old.vat_rate");
    expect(migration).toContain("coalesce(max(revision_number), 0) + 1");
    expect(migration).toContain("for update;");
  });

  it("keeps timeline events append-only and derives unread state per staff member", () => {
    expect(migration).toContain("create table public.lead_activity_logs");
    expect(migration).toContain("create table public.lead_workspace_views");
    expect(migration).toContain("'lead_viewed'");
    expect(migration).toContain("'quotation_draft_created'");
    expect(migration).toContain("'quotation_sent'");
    expect(migration).toContain("'lead_order_ready'");
    expect(migration).toContain("trg_leads__after_insert_update__activity");
    expect(migration).toContain("trg_quotations__after_insert_update__activity");
    expect(migration).toContain("workspace_views.last_viewed_at < leads.updated_at");
  });

  it("exposes only a Sales permission-checked command boundary", () => {
    expect(migration).toContain("'sales.workspace.read'");
    expect(migration).toContain("'sales.workspace.manage'");
    expect(migration).toContain("roles.role_key in ('sales', 'super_admin')");
    expect(migration).toContain("private.require_sales_workspace_permission");
    expect(migration).toContain("public.sales_list_lead_inbox");
    expect(migration).toContain("public.sales_get_lead_detail");
    expect(migration).toContain("public.sales_save_quotation");
    expect(migration).toContain("public.sales_send_quotation");
    expect(migration).toContain("revoke all on function public.sales_save_quotation");
    expect(migration).toContain("grant execute on function public.sales_send_quotation");
  });

  it("has an explicit transaction-safe rollback", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);
    expect(rollback).toContain("drop table public.lead_workspace_views");
    expect(rollback).toContain("drop table public.lead_activity_logs");
    expect(rollback).toContain("drop table public.quotation_line_items");
    expect(rollback).toContain("drop column vat_rate");
    expect(rollback).toContain("delete from public.permissions");
  });
});
