"use server";

import { revalidatePath } from "next/cache";

import {
  setReviewPublication,
  updateQualityAlert,
  upsertCustomerReview,
} from "@/features/reviews-quality/services/reviews-quality.service";
import type { AppLocale } from "@/i18n/routing";

export async function saveCustomerReviewAction(
  token: string,
  locale: AppLocale,
  driverIds: string[],
  formData: FormData,
) {
  const driverRatings = driverIds.flatMap((driverId) => {
    const value = formData.get(`driver_${driverId}`);
    return value ? [{ driver_id: driverId, rating: Number(value) }] : [];
  });
  await upsertCustomerReview(
    token,
    {
      comment: formData.get("comment"),
      handlingRating: formData.get("handlingRating"),
      overallRating: formData.get("overallRating"),
      publicationConsent: formData.get("publicationConsent") === "on",
      punctualityRating: formData.get("punctualityRating"),
    },
    driverRatings,
  );
  revalidatePath(`/${locale}/track/${token}`);
}

export async function setReviewPublicationAction(
  reviewId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await setReviewPublication(reviewId, String(formData.get("action")));
  revalidatePath(`/${locale}/quality/reviews/${reviewId}`);
  revalidatePath(`/${locale}/quality/reviews`);
}

export async function updateQualityAlertAction(
  reviewId: string,
  alertId: string,
  locale: AppLocale,
  formData: FormData,
) {
  await updateQualityAlert(
    alertId,
    String(formData.get("status")),
    String(formData.get("note") || ""),
    String(formData.get("resolution") || ""),
  );
  revalidatePath(`/${locale}/quality/reviews/${reviewId}`);
}
