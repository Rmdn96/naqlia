import {
  ArrowRight,
  CalendarDays,
  FileImage,
  MapPin,
  MessageSquareText,
  Package,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/features/sales-workspace/components/status-badge";
import { formatSalesDate, salesPath } from "@/features/sales-workspace/lib/format";
import type { SalesLeadDetail } from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

import { ActivityTimeline } from "./activity-timeline";
import { AttachmentList } from "./attachment-list";
import { QuotationHistory } from "./quotation-history";

type LeadDetailsProps = {
  detail: SalesLeadDetail;
  locale: AppLocale;
};

function optionNames(options: unknown[], locale: AppLocale): string[] {
  return options.flatMap((option) => {
    if (typeof option !== "object" || option === null || Array.isArray(option)) {
      return [];
    }

    const localized = option as Record<string, unknown>;
    const name = locale === "ar" ? localized.name_ar : localized.name_en;

    return typeof name === "string" ? [name] : [];
  });
}

function AddressCard({
  address,
  icon: Icon,
  locale,
  title,
}: {
  address: SalesLeadDetail["pickup_address"];
  icon: typeof MapPin;
  locale: AppLocale;
  title: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-primary">
        <Icon aria-hidden="true" className="size-5" />
        <h2 className="font-black">{title}</h2>
      </div>
      <p className="mt-4 font-bold text-foreground">{address.formatted_address}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {locale === "ar" ? address.city.name_ar : address.city.name_en}
        {address.district ? ` · ${address.district}` : ""}
      </p>
      {address.route_access_notes ? (
        <p className="mt-3 border-s-2 border-primary/30 ps-3 text-sm leading-6 text-muted-foreground">
          {address.route_access_notes}
        </p>
      ) : null}
    </Card>
  );
}

export async function LeadDetails({ detail, locale }: LeadDetailsProps) {
  const t = await getTranslations("SalesWorkspace");
  const { lead } = detail;
  const serviceOptions = optionNames(lead.service_options_snapshot, locale);

  return (
    <section className="container py-7 sm:py-10" aria-labelledby="lead-details-heading">
      <a
        className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-primary hover:underline"
        href={salesPath(locale, "/leads")}
      >
        <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t("backToInbox")}
      </a>

      <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight" id="lead-details-heading">
              {t("leadDetails")}
            </h1>
            <StatusBadge label={t(`statuses.${lead.status}`)} status={lead.status} />
          </div>
          <bdi className="mt-3 block font-mono text-base font-black text-primary" dir="ltr">
            {lead.reference_number}
          </bdi>
        </div>
        <a
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
          href={salesPath(locale, `/leads/${lead.id}/quotation`)}
        >
          <FileImage aria-hidden="true" className="size-5" />
          {t("createQuotation")}
        </a>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <Package aria-hidden="true" className="size-5" />
              <h2 className="font-black">{t("requestSummary")}</h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t("customer")}</p>
                <p className="mt-1 font-black">{lead.customer_name}</p>
                <bdi className="mt-1 block text-sm text-muted-foreground" dir="ltr">
                  {lead.mobile_number}
                </bdi>
                {lead.email ? (
                  <p className="mt-1 text-sm text-muted-foreground">{lead.email}</p>
                ) : null}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("service")}</p>
                <p className="mt-1 font-black">
                  {locale === "ar" ? lead.service.name_ar : lead.service.name_en}
                </p>
                {serviceOptions.length > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">{serviceOptions.join(" · ")}</p>
                ) : null}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("submitted")}</p>
                <p className="mt-1 inline-flex items-center gap-2 font-bold">
                  <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                  {formatSalesDate(lead.submitted_at, locale)}
                </p>
              </div>
              {lead.cargo_quantity ? (
                <div>
                  <p className="text-sm text-muted-foreground">{t("quantity")}</p>
                  <p className="mt-1 font-bold">{lead.cargo_quantity}</p>
                </div>
              ) : null}
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-sm font-bold text-muted-foreground">{t("cargo")}</p>
              <p className="mt-2 whitespace-pre-wrap leading-7">
                {lead.cargo_description ?? t("notProvided")}
              </p>
            </div>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <AddressCard
              address={detail.pickup_address}
              icon={MapPin}
              locale={locale}
              title={t("pickup")}
            />
            <AddressCard
              address={detail.delivery_address}
              icon={MapPin}
              locale={locale}
              title={t("delivery")}
            />
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquareText aria-hidden="true" className="size-5" />
              <h2 className="font-black">{t("customerNotes")}</h2>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">
              {lead.customer_notes ?? t("notProvided")}
            </p>
            <div className="mt-5 border-t border-border pt-5">
              <h2 className="font-black text-foreground">{t("internalNotes")}</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-muted-foreground">
                {lead.internal_notes ?? t("notProvided")}
              </p>
            </div>
          </Card>

          <QuotationHistory leadId={lead.id} locale={locale} quotations={detail.quotations} />
        </div>
        <aside className="space-y-5">
          <AttachmentList attachments={detail.attachments} />
          <ActivityTimeline activities={detail.activity_log} locale={locale} />
        </aside>
      </div>
    </section>
  );
}
