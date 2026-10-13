import { notFound } from "next/navigation";

import { QualityReviewDetailView } from "@/features/reviews-quality/components/quality-review-detail";
import {
  getQualityCapabilities,
  getQualityReview,
} from "@/features/reviews-quality/services/reviews-quality.service";
import type { AppLocale } from "@/i18n/routing";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: AppLocale; reviewId: string }>;
}) {
  const { locale, reviewId } = await params;
  let detail: Awaited<ReturnType<typeof getQualityReview>>;
  let capabilities: Awaited<ReturnType<typeof getQualityCapabilities>>;
  try {
    [detail, capabilities] = await Promise.all([
      getQualityReview(reviewId),
      getQualityCapabilities(),
    ]);
    if (!detail) return notFound();
  } catch {
    return notFound();
  }
  return <QualityReviewDetailView capabilities={capabilities} detail={detail} locale={locale} />;
}
