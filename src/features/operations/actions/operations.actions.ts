"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";

import {
  completeJob,
  confirmReceipt,
  createTrip,
  issueTracking,
  recoverTracking,
  reviewCancellation,
  requestCancellation,
  saveTrip,
  setTripCondition,
  transitionTrip,
} from "@/features/operations/services/operations.service";
import type { AppLocale } from "@/i18n/routing";

export async function createTripAction(jobId: string, locale: AppLocale) {
  await createTrip(jobId);
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}

export async function recoverTrackingAction(locale: AppLocale, formData: FormData) {
  const token = await recoverTracking({
    mobile: formData.get("mobile"),
    reference: formData.get("reference"),
  });
  if (token) redirect(`/${locale}/track/${token}` as Route);
  redirect(`/${locale}/track?error=invalid` as Route);
}

export async function scheduleTripAction(
  jobId: string,
  tripId: string,
  locale: AppLocale,
  formData: FormData,
) {
  const iso = (name: string) => {
    const riyadhLocal = String(formData.get(name));
    return new Date(`${riyadhLocal}:00+03:00`).toISOString();
  };
  const result = await saveTrip(tripId, {
    pickupWindowStart: iso("pickupStart"),
    pickupWindowEnd: iso("pickupEnd"),
    deliveryWindowStart: iso("deliveryStart"),
    deliveryWindowEnd: iso("deliveryEnd"),
    driverId: formData.get("driverId") || null,
    vehicleId: formData.get("vehicleId") || null,
    workersCount: Number(formData.get("workersCount")),
    overrideConflict: formData.get("override") === "on",
    reason: String(formData.get("reason") || ""),
  });
  if (result.state === "conflict") {
    redirect(`/${locale}/operations/jobs/${jobId}?notice=schedule-conflict` as Route);
  }
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function transitionTripAction(
  jobId: string,
  tripId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await transitionTrip(
    tripId,
    String(formData.get("status")),
    formData.get("override") === "on",
    String(formData.get("reason") || ""),
  );
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function conditionTripAction(
  jobId: string,
  tripId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await setTripCondition(
    tripId,
    String(formData.get("condition")),
    String(formData.get("reason") || ""),
  );
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function issueTrackingAction(jobId: string, locale: AppLocale) {
  const token = await issueTracking(jobId);
  redirect(`/${locale}/track/${token}` as Route);
}
export async function completeJobAction(jobId: string, locale: AppLocale, formData: FormData) {
  if (formData.get("confirm") !== "on") throw new Error("MANUAL_COMPLETION_CONFIRMATION_REQUIRED");
  await completeJob(jobId, String(formData.get("reason") || ""));
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function reviewCancellationAction(
  jobId: string,
  requestId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await reviewCancellation(
    requestId,
    String(formData.get("decision")),
    String(formData.get("reason") || ""),
  );
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function confirmReceiptAction(token: string, locale: AppLocale) {
  await confirmReceipt(token);
  revalidatePath(`/${locale}/track/${token}`);
}
export async function requestCancellationAction(
  token: string,
  locale: AppLocale,
  formData: FormData,
) {
  await requestCancellation(token, String(formData.get("reason") || ""));
  revalidatePath(`/${locale}/track/${token}`);
}
