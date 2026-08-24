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
  try {
    const [detail, capabilities] = await Promise.all([
      getQualityReview(reviewId),
      getQualityCapabilities(),
    ]);
    if (!detail) return notFound();
    return <QualityReviewDetailView capabilities={capabilities} detail={detail} locale={locale} />;
  } catch {
    return notFound();
  }
}
