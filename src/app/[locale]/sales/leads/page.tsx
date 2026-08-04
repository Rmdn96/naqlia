import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeadInbox } from "@/features/sales-workspace/components/lead-inbox";
import {
  getSalesLeadInbox,
  getSalesWorkspaceFilterCatalog,
} from "@/features/sales-workspace/services/sales-workspace.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type LeadInboxPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function valueOf(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}

function pageNumber(value: string | undefined): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ params }: LeadInboxPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations({ locale, namespace: "SalesWorkspace" });

  return { description: t("metaDescription"), title: t("metaTitle") };
}

export default async function LeadInboxPage({ params, searchParams }: LeadInboxPageProps) {
  const [{ locale: localeParam }, rawSearchParams] = await Promise.all([params, searchParams]);
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);
  const search = valueOf(rawSearchParams.search);
  const status = valueOf(rawSearchParams.status);
  const serviceId = valueOf(rawSearchParams.serviceId);
  const cityId = valueOf(rawSearchParams.cityId);
  const sortBy = valueOf(rawSearchParams.sortBy);
  const sortDirection = valueOf(rawSearchParams.sortDirection);
  const query = {
    cityId,
    page: pageNumber(valueOf(rawSearchParams.page)),
    search,
    serviceId,
    sortBy:
      sortBy === "customer_name" || sortBy === "reference_number" || sortBy === "status"
        ? sortBy
        : "submitted_at",
    sortDirection: sortDirection === "asc" ? "asc" : "desc",
    status,
  } as const;
  const [catalog, page] = await Promise.all([
    getSalesWorkspaceFilterCatalog(locale),
    getSalesLeadInbox(query),
  ]);

  return <LeadInbox catalog={catalog} locale={locale} page={page} query={query} />;
}
