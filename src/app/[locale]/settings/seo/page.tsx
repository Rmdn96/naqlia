import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoManagementView } from "@/features/seo/components/seo-management-view";
import { getAdminCitySeoContents } from "@/features/seo/services/seo.service";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { follow: false, index: false } };

export default async function SeoSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ city?: string; result?: string }>;
}) {
  const [{ locale }, query, context] = await Promise.all([
    params,
    searchParams,
    getPortalContext(),
  ]);
  if (!context?.permissions.includes("settings.seo.read")) notFound();
  return (
    <SeoManagementView
      locale={locale}
      payload={await getAdminCitySeoContents()}
      result={query.result}
      selected={query.city}
    />
  );
}
