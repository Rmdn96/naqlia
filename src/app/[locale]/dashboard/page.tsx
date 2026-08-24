import type { Metadata } from "next";

import { PortalDashboardView } from "@/features/staff-portal/components/portal-dashboard";
import { getPortalDashboard } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { follow: false, index: false, noarchive: true, nocache: true },
};
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  return <PortalDashboardView dashboard={await getPortalDashboard()} locale={locale} />;
}
