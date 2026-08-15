import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { QuotationBuilder } from "@/features/sales-workspace/components/quotation-builder";
import { salesQuotationIdSchema } from "@/features/sales-workspace/lib/validation";
import { getSalesLeadDetail } from "@/features/sales-workspace/services/sales-workspace.service";
import { getDefaultQuotationVatRate } from "@/config/env";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type QuotationBuilderPageProps = {
  params: Promise<{ leadId: string; locale: string }>;
  searchParams: Promise<{ quotation?: string | string[] }>;
};

export default async function QuotationBuilderPage({
  params,
  searchParams,
}: QuotationBuilderPageProps) {
  const [{ leadId, locale: localeParam }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);
  const quotationId =
    typeof rawSearchParams.quotation === "string" ? rawSearchParams.quotation : undefined;

  try {
    const [detail, business] = await Promise.all([
      getSalesLeadDetail(leadId),
      getPublicBusinessConfiguration(),
    ]);
    const selectedQuotation = quotationId
      ? detail.quotations.find(
          (quotation) => quotation.id === salesQuotationIdSchema.parse(quotationId),
        )
      : null;

    if (quotationId && !selectedQuotation) {
      notFound();
    }

    return (
      <section className="container py-7 sm:py-10">
        <QuotationBuilder
          defaultValidityDays={business.quotationValidityDays}
          defaultVatRate={getDefaultQuotationVatRate()}
          initialQuotation={selectedQuotation ?? null}
          customerLocale={detail.lead.preferred_locale}
          leadId={leadId}
          locale={locale}
        />
      </section>
    );
  } catch {
    notFound();
  }
}
