import "server-only";

import { trackingTokenSchema } from "@/features/operations/lib/validation";
import {
  customerReviewSchema,
  qualityAlertStatusSchema,
  qualityPublicationActionSchema,
  reviewUuidSchema,
} from "@/features/reviews-quality/lib/validation";
import type {
  CustomerReviewContext,
  QualityInboxPage,
  QualityReviewDetail,
} from "@/features/reviews-quality/types/reviews-quality";
import { requireQualityWorkspacePermission } from "@/lib/auth/quality-workspace";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

function object<T>(value: Json | null, code: string): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as T;
}

export async function getCustomerReviewContext(
  token: string,
): Promise<CustomerReviewContext | null> {
  const parsed = trackingTokenSchema.safeParse(token);
  if (!parsed.success) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_get_job_review", { p_token: parsed.data });
  if (error) return null;
  const result = object<Record<string, unknown>>(data, "REVIEW_CONTEXT_INVALID");
  return result.state === "eligible" ? (result as CustomerReviewContext) : null;
}

export async function upsertCustomerReview(
  token: string,
  input: unknown,
  driverRatings: Array<{ driver_id: string; rating: number }>,
) {
  const value = customerReviewSchema.parse(input);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_upsert_job_review", {
    p_comment: value.comment,
    p_driver_ratings: driverRatings,
    p_handling_rating: value.handlingRating,
    p_overall_rating: value.overallRating,
    p_publication_consent: value.publicationConsent,
    p_punctuality_rating: value.punctualityRating,
    p_token: trackingTokenSchema.parse(token),
  });
  if (error) throw new Error("REVIEW_SAVE_FAILED", { cause: error });
  const result = object<Record<string, unknown>>(data, "REVIEW_SAVE_INVALID");
  if (result.state !== "eligible") throw new Error("REVIEW_SAVE_INVALID");
}

export async function listQualityReviews(query: {
  alertStatus?: string;
  page?: number;
  publicationStatus?: string;
  rating?: number;
}): Promise<QualityInboxPage> {
  await requireQualityWorkspacePermission("quality.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("quality_list_reviews", {
    p_alert_status: query.alertStatus || null,
    p_page: query.page ?? 1,
    p_page_size: 20,
    p_publication_status: query.publicationStatus || null,
    p_rating: query.rating || null,
  });
  if (error) throw new Error("QUALITY_INBOX_UNAVAILABLE", { cause: error });
  return object(data, "QUALITY_INBOX_INVALID");
}

export async function getQualityReview(reviewId: string): Promise<QualityReviewDetail> {
  await requireQualityWorkspacePermission("quality.workspace.read");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("quality_get_review", {
    p_review: reviewUuidSchema.parse(reviewId),
  });
  if (error) throw new Error("QUALITY_REVIEW_UNAVAILABLE", { cause: error });
  return object(data, "QUALITY_REVIEW_INVALID");
}

export async function getQualityCapabilities(): Promise<{
  canManageAlerts: boolean;
  canManagePublication: boolean;
}> {
  await requireQualityWorkspacePermission("quality.workspace.read");
  const supabase = await createServerSupabaseClient();
  const [alerts, publication] = await Promise.all([
    supabase.rpc("has_permission", { requested_permission: "quality.alert.manage" }),
    supabase.rpc("has_permission", { requested_permission: "quality.publication.manage" }),
  ]);
  return {
    canManageAlerts: !alerts.error && alerts.data === true,
    canManagePublication: !publication.error && publication.data === true,
  };
}

export async function setReviewPublication(reviewId: string, action: string) {
  await requireQualityWorkspacePermission("quality.publication.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("quality_set_review_publication", {
    p_action: qualityPublicationActionSchema.parse(action),
    p_review: reviewUuidSchema.parse(reviewId),
  });
  if (error) throw new Error("QUALITY_PUBLICATION_FAILED", { cause: error });
}

export async function updateQualityAlert(
  alertId: string,
  status: string,
  note?: string,
  resolution?: string,
) {
  await requireQualityWorkspacePermission("quality.alert.manage");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("quality_update_alert", {
    p_alert: reviewUuidSchema.parse(alertId),
    p_note: note?.trim() || null,
    p_resolution: resolution?.trim() || null,
    p_status: qualityAlertStatusSchema.parse(status),
  });
  if (error) throw new Error("QUALITY_ALERT_UPDATE_FAILED", { cause: error });
}
