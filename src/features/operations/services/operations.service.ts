import "server-only";

import { requireOperationsWorkspacePermission } from "@/lib/auth/operations-workspace";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  operationsUuidSchema,
  trackingRecoverySchema,
  trackingTokenSchema,
  tripScheduleSchema,
} from "@/features/operations/lib/validation";
import type {
  OperationsInboxPage,
  OperationsJobDetail,
  TrackingPayload,
} from "@/features/operations/types/operations";
import type { Json } from "@/types/supabase";

function object<T>(value: Json | null, code: string): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as T;
}

export async function listOperationsJobs(query: {
  page?: number;
  search?: string;
  status?: string;
}): Promise<OperationsInboxPage> {
  await requireOperationsWorkspacePermission("operations.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("operations_list_jobs", {
    p_page: query.page ?? 1,
    p_page_size: 20,
    p_search: query.search?.trim() || null,
    p_status: query.status || null,
  });
  if (error) throw new Error("OPERATIONS_INBOX_UNAVAILABLE", { cause: error });
  return object(data, "OPERATIONS_INBOX_INVALID");
}

export async function getOperationsJob(id: string): Promise<OperationsJobDetail> {
  await requireOperationsWorkspacePermission("operations.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("operations_get_job", {
    p_job: operationsUuidSchema.parse(id),
  });
  if (error) throw new Error("OPERATIONS_JOB_UNAVAILABLE", { cause: error });
  const detail = object<OperationsJobDetail>(data, "OPERATIONS_JOB_INVALID");
  const [drivers, vehicles] = await Promise.all([
    supabase
      .from("drivers")
      .select("id, display_name")
      .eq("status", "active")
      .order("display_name"),
    supabase
      .from("vehicles")
      .select("id, vehicle_type, plate_number")
      .eq("status", "active")
      .order("plate_number"),
  ]);
  if (drivers.error || vehicles.error) throw new Error("OPERATIONS_RESOURCES_UNAVAILABLE");
  return { ...detail, resources: { drivers: drivers.data, vehicles: vehicles.data } };
}

export async function createTrip(jobId: string): Promise<void> {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operations_create_trip", {
    p_job: operationsUuidSchema.parse(jobId),
  });
  if (error) throw new Error("TRIP_CREATE_FAILED", { cause: error });
}

export async function saveTrip(
  tripId: string,
  input: unknown,
): Promise<{ conflicts?: Array<{ trip_number?: number }>; state: "conflict" | "saved" }> {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const value = tripScheduleSchema.parse(input);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("operations_save_trip", {
    p_trip: operationsUuidSchema.parse(tripId),
    p_payload: {
      delivery_window_end: value.deliveryWindowEnd,
      delivery_window_start: value.deliveryWindowStart,
      driver_id: value.driverId,
      override_conflict: value.overrideConflict,
      pickup_window_end: value.pickupWindowEnd,
      pickup_window_start: value.pickupWindowStart,
      reason: value.reason,
      vehicle_id: value.vehicleId,
      workers_count: value.workersCount,
    },
  });
  if (error) throw new Error("TRIP_SAVE_FAILED", { cause: error });
  return object(data, "TRIP_SAVE_INVALID");
}

export async function transitionTrip(
  tripId: string,
  status: string,
  override = false,
  reason?: string,
) {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operations_transition_trip", {
    p_override: override,
    p_reason: reason || null,
    p_status: status,
    p_trip: operationsUuidSchema.parse(tripId),
  });
  if (error) throw new Error("TRIP_TRANSITION_FAILED", { cause: error });
}

export async function setTripCondition(tripId: string, condition: string, reason?: string) {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operations_set_trip_condition", {
    p_condition: condition,
    p_customer_ar: null,
    p_customer_en: null,
    p_internal_reason: reason || null,
    p_trip: operationsUuidSchema.parse(tripId),
  });
  if (error) throw new Error("TRIP_CONDITION_FAILED", { cause: error });
}

export async function issueTracking(jobId: string): Promise<string> {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("operations_issue_tracking_access", {
    p_job: operationsUuidSchema.parse(jobId),
  });
  if (error) throw new Error("TRACKING_ISSUE_FAILED", { cause: error });
  const result = object<{ tracking_token?: string }>(data, "TRACKING_ISSUE_INVALID");
  if (!trackingTokenSchema.safeParse(result.tracking_token).success)
    throw new Error("TRACKING_ISSUE_INVALID");
  return result.tracking_token!;
}

export async function completeJob(jobId: string, reason: string) {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operations_complete_job", {
    p_job: operationsUuidSchema.parse(jobId),
    p_reason: reason.trim(),
  });
  if (error) throw new Error("JOB_COMPLETION_FAILED", { cause: error });
}

export async function reviewCancellation(requestId: string, decision: string, reason: string) {
  await requireOperationsWorkspacePermission("operations.workspace.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("operations_review_cancellation", {
    p_decision: decision,
    p_reason: reason.trim(),
    p_request: operationsUuidSchema.parse(requestId),
  });
  if (error) throw new Error("CANCELLATION_REVIEW_FAILED", { cause: error });
}

export async function getTracking(token: string): Promise<TrackingPayload | null> {
  const parsed = trackingTokenSchema.safeParse(token);
  if (!parsed.success) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_get_job_tracking", { p_token: parsed.data });
  if (error) return null;
  const result = object<Record<string, unknown>>(data, "TRACKING_INVALID");
  return result.state === "active" ? (result as TrackingPayload) : null;
}

export async function recoverTracking(input: unknown): Promise<string | null> {
  const value = trackingRecoverySchema.parse(input);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_recover_job_tracking", {
    p_mobile: value.mobile,
    p_reference: value.reference,
  });
  if (error) return null;
  const result = object<{ state?: string; tracking_token?: string }>(data, "RECOVERY_INVALID");
  return result.state === "issued" && trackingTokenSchema.safeParse(result.tracking_token).success
    ? result.tracking_token!
    : null;
}

export async function confirmReceipt(token: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("customer_confirm_job_receipt", {
    p_token: trackingTokenSchema.parse(token),
  });
  if (error) throw new Error("RECEIPT_CONFIRMATION_FAILED", { cause: error });
}

export async function requestCancellation(token: string, reason?: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("customer_request_job_cancellation", {
    p_reason: reason?.trim() || null,
    p_token: trackingTokenSchema.parse(token),
  });
  if (error) throw new Error("CANCELLATION_REQUEST_FAILED", { cause: error });
}
