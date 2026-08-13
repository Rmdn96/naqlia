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
  const iso = (name: string) => new Date(String(formData.get(name))).toISOString();
  await saveTrip(tripId, {
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
  revalidatePath(`/${locale}/operations/jobs/${jobId}`);
}
export async function transitionTripAction(
  jobId: string,
  tripId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await transitionTrip(tripId, String(formData.get("status")));
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
  await completeJob(jobId, String(formData.get("reason") || ""));
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
