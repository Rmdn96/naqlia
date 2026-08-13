import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260813150000_operations_management.sql"),
  "utf8",
);
const rollback = readFileSync(
  resolve(process.cwd(), "supabase/rollbacks/20260813150000_operations_management.rollback.sql"),
  "utf8",
);

describe("Operations Management database contract", () => {
  it("extends Order into exactly one Job and one-to-many Trips transactionally", () => {
    expect(migration).toContain("uq_operational_jobs__order_id unique (order_id)");
    expect(migration).toContain("trg_orders__after_insert__create_job");
    expect(migration).toContain("on conflict(order_id) do nothing");
    expect(migration).toContain("unique (job_id, trip_number)");
    expect(migration).not.toMatch(/create trigger[^]*create trip/i);
  });

  it("starts Jobs and Trips unscheduled and derives the aggregate across all active Trips", () => {
    expect(migration).toContain("status text not null default 'unscheduled'");
    expect(migration).toContain("when v_delivered=v_total then 'awaiting_customer_confirmation'");
    expect(migration).toContain("when v_total=0 then 'unscheduled'");
    expect(migration).not.toContain("v_delivered>0 then 'awaiting_customer_confirmation'");
  });

  it("enforces valid Riyadh windows, workers, resources, and conflict warnings", () => {
    expect(migration).toContain("pickup_window_start < pickup_window_end");
    expect(migration).toContain("pickup_window_end <= delivery_window_start");
    expect(migration).toContain("workers_count between 0 and 100");
    expect(migration).toContain("Inactive Driver cannot be assigned");
    expect(migration).toContain("Inactive Vehicle cannot be assigned");
    expect(migration).toContain("jsonb_build_object('state','conflict'");
    expect(migration).toContain("schedule_conflict_overridden");
  });

  it("uses a strict normal state machine with exceptional reasoned override", () => {
    for (const state of [
      "scheduled",
      "confirmed",
      "en_route_pickup",
      "loading",
      "in_transit",
      "arrived",
      "delivered",
      "cancelled",
    ])
      expect(migration).toContain(`'${state}'`);
    expect(migration).toContain("Unsupported Trip state transition");
    expect(migration).toContain("Administrative override reason is required");
    expect(migration).toContain("Terminal Trip state is protected");
  });

  it("keeps delay, pause, and issue conditions separate from execution state", () => {
    expect(migration).toContain("condition in ('normal','delayed','paused','operational_issue')");
    expect(migration).toContain("trip_condition_recorded");
    expect(migration).toContain("trip_condition_resolved");
    expect(migration).not.toMatch(/set status=p_condition/);
  });

  it("uses 256-bit hashed tracking capabilities with rotation and no token activity payload", () => {
    expect(migration).toContain("extensions.gen_random_bytes(32)");
    expect(migration).toContain("extensions.digest(v_token,'sha256')");
    expect(migration).toContain("octet_length(token_hash)=32");
    expect(migration).toContain("revocation_reason='rotated'");
    expect(migration).not.toContain(
      "jsonb_build_object('tracking_token',v_access.plaintext_token" + ",'",
    );
    expect(migration).not.toMatch(/write_operation_activity[^;]*plaintext_token/);
  });

  it("projects customer-safe data without internal conditions, UUIDs, or financial data", () => {
    const start = migration.indexOf("function private.customer_job_payload");
    const end = migration.indexOf("$$;", start);
    const payload = migration.slice(start, end);
    expect(payload).not.toContain("condition_internal_reason");
    expect(payload).not.toContain("internal_notes");
    expect(payload).not.toContain("total_amount");
    expect(payload).not.toMatch(/'id'/);
  });

  it("makes customer confirmation and cancellation idempotent and server-authoritative", () => {
    expect(migration).toContain("customer_confirmed_at=now()");
    expect(migration).toContain("if v_job.status='completed'");
    expect(migration).toContain("on conflict(job_id) where status='pending' do nothing");
    expect(migration).toContain("Cancellation request is not pending");
    expect(migration).toContain("All active Trips must be Delivered first");
  });

  it("grants Operations and Super Admin mutation while Sales is read-only", () => {
    expect(migration).toContain("roles.role_key in ('operations', 'super_admin')");
    expect(migration).toContain(
      "roles.role_key = 'sales' and permissions.permission_key = 'operations.workspace.read'",
    );
    expect(migration).not.toMatch(/roles\.role_key = 'sales'[^;]+operations\.workspace\.manage/);
  });

  it("allows anon only through the four narrow customer RPCs", () => {
    expect(migration).toContain(
      "grant execute on function public.customer_get_job_tracking(text),public.customer_recover_job_tracking(text,text),public.customer_confirm_job_receipt(text),public.customer_request_job_cancellation(text,text) to anon,authenticated",
    );
    expect(migration).toContain(
      "revoke all on table public.external_transport_companies,public.drivers,public.vehicles,public.operational_jobs,public.trips,public.trip_assignment_history,public.job_tracking_accesses,public.job_cancellation_requests from public,anon,authenticated",
    );
    expect(migration).not.toMatch(/grant select[^;]+to anon/);
  });

  it("hardens every privileged boundary with fixed search_path and internal permission checks", () => {
    for (const name of [
      "operations_list_jobs",
      "operations_get_job",
      "operations_create_trip",
      "operations_save_trip",
      "operations_transition_trip",
      "operations_issue_tracking_access",
    ]) {
      const body = migration.slice(
        migration.indexOf(`function public.${name}`),
        migration.indexOf("$$;", migration.indexOf(`function public.${name}`)) + 3,
      );
      expect(body).toContain("security definer");
      expect(body).toContain("set search_path=''");
    }
  });

  it("provides a transactional fail-closed rollback", () => {
    expect(rollback.trimStart()).toMatch(/^begin;/);
    expect(rollback.trimEnd()).toMatch(/commit;$/);
    expect(rollback).toContain("Rollback refused");
    expect(rollback).toContain("drop table public.operational_jobs");
  });
});
