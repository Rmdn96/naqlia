import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { QuotationHistory } from "@/features/sales-workspace/components/quotation-history";
import { getSalesLeadDetail } from "@/features/sales-workspace/services/sales-workspace.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type QuotationHistoryPageProps = {
  params: Promise<{ leadId: string; locale: string }>;
};

export default async function QuotationHistoryPage({ params }: QuotationHistoryPageProps) {
  const { leadId, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);

  try {
    const detail = await getSalesLeadDetail(leadId);

    return (
      <section className="container py-7 sm:py-10">
        <QuotationHistory leadId={leadId} locale={locale} quotations={detail.quotations} />
      </section>
    );
  } catch {
    notFound();
  }
}
