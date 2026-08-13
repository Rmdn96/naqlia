import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackingView } from "@/features/operations/components/tracking-view";
import { getTracking } from "@/features/operations/services/operations.service";
import type { AppLocale } from "@/i18n/routing";
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
  const data = await getTracking(token);
  if (!data) notFound();
  return <TrackingView data={data} locale={locale} token={token} />;
}
