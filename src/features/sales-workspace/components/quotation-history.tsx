import { ArrowUpRight, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/sales-workspace/components/status-badge";
import {
  formatSalesCurrency,
  formatSalesDate,
  salesPath,
} from "@/features/sales-workspace/lib/format";
import type { SalesQuotation } from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

type QuotationHistoryProps = {
  leadId: string;
  locale: AppLocale;
  quotations: SalesQuotation[];
};

export async function QuotationHistory({ leadId, locale, quotations }: QuotationHistoryProps) {
  const t = await getTranslations("SalesWorkspace");

  return (
    <section aria-labelledby="quotation-history-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">{t("quotation")}</p>
          <h2 className="mt-1 text-2xl font-black" id="quotation-history-heading">
            {t("quotationHistory")}
          </h2>
        </div>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
          href={salesPath(locale, `/leads/${leadId}/quotation`)}
        >
          <FileText aria-hidden="true" className="size-4" />
          {t("createQuotation")}
        </a>
      </div>

      <Card className="overflow-hidden">
        {quotations.length === 0 ? (
          <p className="p-7 text-sm font-semibold text-muted-foreground">{t("noActivity")}</p>
        ) : (
          <div className="divide-y divide-border">
            {quotations.map((quotation) => (
              <article className="p-5 sm:p-6" key={quotation.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <bdi className="font-mono text-sm font-black text-primary" dir="ltr">
                        {quotation.quotation_number}
                      </bdi>
                      <StatusBadge
                        label={t(`statuses.${quotation.status}`)}
                        status={quotation.status}
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-muted-foreground">
                      {t("revision", { number: quotation.revision_number })}
                    </p>
                  </div>
                  <p className="text-lg font-black">
                    {formatSalesCurrency(quotation.quoted_amount, quotation.currency, locale)}
                  </p>
                </div>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">{t("sent")}</dt>
                    <dd className="mt-1 font-bold">{formatSalesDate(quotation.sent_at, locale)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("expires")}</dt>
                    <dd className="mt-1 font-bold">
                      {formatSalesDate(quotation.expires_at, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("approved")}</dt>
                    <dd className="mt-1 font-bold">
                      {formatSalesDate(quotation.approved_at, locale)}
                    </dd>
                  </div>
                </dl>
                <a
                  className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary hover:underline"
                  href={salesPath(locale, `/leads/${leadId}/quotation?quotation=${quotation.id}`)}
                >
                  {quotation.status === "draft" ? t("editDraft") : t("quotationBuilder")}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </article>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
