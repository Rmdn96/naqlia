import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260812190000_customer_quotation_response.sql"),
  "utf8",
);

describe("customer quotation response database contract", () => {
  it("stores only a 256-bit token digest and scopes every access to one quotation", () => {
    expect(migration).toContain("extensions.gen_random_bytes(32)");
    expect(migration).toContain("extensions.digest(token_value, 'sha256')");
    expect(migration).toContain("octet_length(token_hash) = 32");
    expect(migration).toContain("foreign key (quotation_id) references public.quotations");
    expect(migration).not.toMatch(
      /plaintext_token\s+text[^]*create table public\.quotation_customer_accesses/i,
    );
  });

  it("provides invalid, revoked, expired, superseded, accepted and rejected states", () => {
    for (const state of ["invalid", "revoked", "expired", "superseded", "approved", "rejected"]) {
      expect(migration).toContain(`'${state}'`);
    }
    expect(migration).toContain("quotation_row.expires_at <= now()");
    expect(migration).toContain("access_row.expires_at <= now()");
  });

  it("serializes responses and creates exactly one order transactionally", () => {
    expect(migration).toContain("for update;");
    expect(migration).toContain("on conflict (quotation_id) do nothing");
    expect(migration).toContain("update public.quotations set status = 'approved'");
    expect(migration).toContain("insert into public.orders");
    expect(migration.trimStart()).toMatch(/^begin;/);
    expect(migration.trimEnd()).toMatch(/commit;$/);
  });

  it("prevents accepting an old revision and rotates access on reissue", () => {
    expect(migration).toContain("superseded_by_quotation_id");
    expect(migration).toContain("private.revoke_quotation_customer_accesses");
    expect(migration).toContain("'reissued'");
    expect(migration).toContain("'superseded'");
    expect(migration).toContain("where lead_id = quotation_row.lead_id and status = 'sent'");
  });

  it("keeps public access behind narrow RPCs and grants no anonymous table access", () => {
    expect(migration).toContain(
      "revoke all on table public.quotation_customer_accesses from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.customer_get_quotation(text) to anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.customer_respond_to_quotation(text, text, text, text) to anon, authenticated",
    );
    expect(migration).not.toMatch(/grant\s+select\s+on\s+table\s+public\.quotations\s+to\s+anon/i);
  });

  it("uses hardened security-definer boundaries", () => {
    const functions = [
      "sales_reissue_quotation_access",
      "customer_get_quotation",
      "customer_respond_to_quotation",
    ];
    for (const functionName of functions) {
      const start = migration.indexOf(`function public.${functionName}`);
      const body = migration.slice(start, migration.indexOf("$$;", start) + 3);
      expect(body).toContain("security definer");
      expect(body).toContain("set search_path = ''");
    }
  });

  it("records meaningful events without putting the plaintext token in activity metadata", () => {
    for (const event of [
      "customer_quotation_access_issued",
      "customer_quotation_viewed",
      "customer_accepted_quotation",
      "customer_rejected_quotation",
      "order_created_from_quotation",
      "customer_access_revoked",
    ]) {
      expect(migration).toContain(`'${event}'`);
    }
    expect(migration).not.toContain("jsonb_build_object('access_token'");
    expect(migration).not.toContain("jsonb_build_object('plaintext_token'");
  });

  it("never includes internal notes or identifiers in the customer payload", () => {
    const start = migration.indexOf("function private.customer_quotation_payload");
    const end = migration.indexOf("$$;", start);
    const payloadFunction = migration.slice(start, end);
    expect(payloadFunction).not.toContain("internal_notes");
    expect(payloadFunction).not.toContain("approved_by_profile_id");
    expect(payloadFunction).not.toContain("actor_profile_id");
    expect(payloadFunction).not.toMatch(/'id'/);
  });
});
