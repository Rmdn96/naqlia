import type { Metadata } from "next";
import { ActivityLogView } from "@/features/staff-portal/components/activity-log-view";
import { getActivity } from "@/features/staff-portal/services/administration.service";
import type { AppLocale } from "@/i18n/routing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ area?: string; event?: string; search?: string }>;
}) {
  const { locale } = await params;
  const q = await searchParams;
  return (
    <ActivityLogView
      locale={locale}
      payload={await getActivity(q.search, q.area, q.event)}
      query={q}
    />
  );
}
