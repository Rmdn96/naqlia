import type { Metadata } from "next";
import { BusinessSettingsView } from "@/features/staff-portal/components/business-settings-view";
import { getBusinessSettings } from "@/features/staff-portal/services/administration.service";
import type { AppLocale } from "@/i18n/routing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function BusinessSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  return (
    <BusinessSettingsView
      locale={locale}
      payload={await getBusinessSettings()}
      result={query.result}
    />
  );
}
