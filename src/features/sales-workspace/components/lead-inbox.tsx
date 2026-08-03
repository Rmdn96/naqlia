import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/features/sales-workspace/components/status-badge";
import { formatSalesDate, salesPath } from "@/features/sales-workspace/lib/format";
import type {
  LeadStatus,
  SalesInboxPage,
  SalesWorkspaceFilterCatalog,
} from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

type LeadInboxProps = {
  catalog: SalesWorkspaceFilterCatalog;
  locale: AppLocale;
  page: SalesInboxPage;
  query: {
    cityId?: string;
    search?: string;
    serviceId?: string;
    sortBy?: string;
    sortDirection?: string;
    status?: string;
  };
};

const leadStatuses: LeadStatus[] = [
  "new",
  "qualified",
  "quoted",
  "converted",
  "closed",
  "cancelled",
];

function createInboxHref(
  locale: AppLocale,
  query: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return `${salesPath(locale, "/leads")}${queryString ? `?${queryString}` : ""}`;
}

export async function LeadInbox({ catalog, locale, page, query }: LeadInboxProps) {
  const t = await getTranslations("SalesWorkspace");
  const totalPages = Math.max(1, Math.ceil(page.total / page.page_size));
  const isFirstPage = page.page <= 1;
  const isLastPage = page.page >= totalPages;
  const direction = query.sortDirection === "asc" ? "asc" : "desc";

  return (
    <section className="container py-7 sm:py-10" aria-labelledby="lead-inbox-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary">{t("workspace")}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight" id="lead-inbox-heading">
            {t("leadInbox")}
          </h1>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{page.total}</p>
      </div>

      <Card className="p-4 sm:p-5">
        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))_auto]"
          method="get"
        >
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("search")}</span>
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="ps-10"
                defaultValue={query.search}
                name="search"
                placeholder={t("searchPlaceholder")}
                type="search"
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("allStatuses")}</span>
            <select
              className="min-h-12 rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">{t("allStatuses")}</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("allServices")}</span>
            <select
              className="min-h-12 rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={query.serviceId ?? ""}
              name="serviceId"
            >
              <option value="">{t("allServices")}</option>
              {catalog.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("allCities")}</span>
            <select
              className="min-h-12 rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={query.cityId ?? ""}
              name="cityId"
            >
              <option value="">{t("allCities")}</option>
              {catalog.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("sortBy")}</span>
            <select
              className="min-h-12 rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={query.sortBy ?? "submitted_at"}
              name="sortBy"
            >
              <option value="submitted_at">{t("sortDate")}</option>
              <option value="customer_name">{t("sortCustomer")}</option>
              <option value="reference_number">{t("sortReference")}</option>
              <option value="status">{t("sortStatus")}</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            <span className="sr-only">{t("sortBy")}</span>
            <select
              className="min-h-12 rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={direction}
              name="sortDirection"
            >
              <option value="desc">{t("descending")}</option>
              <option value="asc">{t("ascending")}</option>
            </select>
          </label>
          <Button className="w-full lg:w-auto" type="submit">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            {t("apply")}
          </Button>
        </form>
      </Card>

      <Card className="mt-5 overflow-hidden">
        {page.items.length === 0 ? (
          <p className="p-8 text-center text-sm font-semibold text-muted-foreground">
            {t("noLeads")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-start text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-black uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 text-start">{t("reference")}</th>
                  <th className="px-5 py-4 text-start">{t("customer")}</th>
                  <th className="px-5 py-4 text-start">{t("service")}</th>
                  <th className="px-5 py-4 text-start">{t("city")}</th>
                  <th className="px-5 py-4 text-start">{t("submitted")}</th>
                  <th className="px-5 py-4 text-start">{t("status")}</th>
                  <th className="px-5 py-4 text-start">
                    <span className="sr-only">{t("viewLead")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {page.items.map((lead) => (
                  <tr className="transition-colors hover:bg-muted/35" key={lead.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {lead.is_unread ? (
                          <span
                            aria-label={t("unread")}
                            className="size-2 rounded-full bg-primary"
                          />
                        ) : null}
                        <bdi className="font-mono text-xs font-black text-primary" dir="ltr">
                          {lead.reference_number}
                        </bdi>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">{lead.customer_name}</p>
                      <bdi className="mt-1 block text-xs text-muted-foreground" dir="ltr">
                        {lead.mobile_number}
                      </bdi>
                    </td>
                    <td className="px-5 py-4">
                      {locale === "ar" ? lead.service_name_ar : lead.service_name_en}
                    </td>
                    <td className="px-5 py-4">
                      {locale === "ar" ? lead.city_name_ar : lead.city_name_en}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {formatSalesDate(lead.submitted_at, locale)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={t(`statuses.${lead.status}`)} status={lead.status} />
                    </td>
                    <td className="px-5 py-4">
                      <a
                        className="text-sm font-black text-primary hover:underline"
                        href={salesPath(locale, `/leads/${lead.id}`)}
                      >
                        {t("viewLead")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <nav aria-label={t("leadInbox")} className="mt-5 flex items-center justify-between gap-3">
        {isFirstPage ? (
          <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold text-muted-foreground/50">
            <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            {t("previous")}
          </span>
        ) : (
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-bold transition hover:bg-muted"
            href={createInboxHref(locale, { ...query, page: page.page - 1 })}
          >
            <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            {t("previous")}
          </a>
        )}
        <span className="text-sm font-bold text-muted-foreground">
          {t("pageSummary", { page: page.page, pages: totalPages })}
        </span>
        {isLastPage ? (
          <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold text-muted-foreground/50">
            {t("next")}
            <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </span>
        ) : (
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-bold transition hover:bg-muted"
            href={createInboxHref(locale, { ...query, page: page.page + 1 })}
          >
            {t("next")}
            <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </a>
        )}
      </nav>
    </section>
  );
}
