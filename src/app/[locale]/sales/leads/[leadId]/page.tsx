import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { LeadDetails } from "@/features/sales-workspace/components/lead-details";
import {
  getSalesLeadDetail,
  markSalesLeadViewed,
} from "@/features/sales-workspace/services/sales-workspace.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type LeadDetailsPageProps = {
  params: Promise<{ leadId: string; locale: string }>;
};

export default async function LeadDetailsPage({ params }: LeadDetailsPageProps) {
  const { leadId, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);

  try {
    await markSalesLeadViewed(leadId);
    const detail = await getSalesLeadDetail(leadId);

    return <LeadDetails detail={detail} locale={locale} />;
  } catch {
    notFound();
  }
}
