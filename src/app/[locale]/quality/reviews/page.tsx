import { QualityInbox } from "@/features/reviews-quality/components/quality-inbox";
import { listQualityReviews } from "@/features/reviews-quality/services/reviews-quality.service";
import type { AppLocale } from "@/i18n/routing";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ alert?: string; page?: string; publication?: string; rating?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const page = await listQualityReviews({
    alertStatus: query.alert,
    page: Number(query.page) || 1,
    publicationStatus: query.publication,
    rating: Number(query.rating) || undefined,
  });
  return <QualityInbox locale={locale} page={page} />;
}
