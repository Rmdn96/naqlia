import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackingView } from "@/features/operations/components/tracking-view";
import { getTracking } from "@/features/operations/services/operations.service";
import { getCustomerReviewContext } from "@/features/reviews-quality/services/reviews-quality.service";
import type { AppLocale } from "@/i18n/routing";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Secure tracking | Naqlk",
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: AppLocale; token: string }>;
}) {
  const { locale, token } = await params;
  const [data, reviewContext, business] = await Promise.all([
    getTracking(token),
    getCustomerReviewContext(token),
    getPublicBusinessConfiguration(),
  ]);
  if (!data) notFound();
  return (
    <TrackingView
      business={business}
      data={data}
      locale={locale}
      reviewContext={reviewContext}
      token={token}
    />
  );
}
