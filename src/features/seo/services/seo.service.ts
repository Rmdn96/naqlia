import "server-only";

import { cache } from "react";

import type { AppLocale } from "@/i18n/routing";
import type { Json } from "@/types/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminCitySeoItem,
  AdminCitySeoPayload,
  CitySeoIndexItem,
  CitySeoPage,
  SeoFaq,
  SeoRoute,
} from "@/features/seo/types/seo";

type RawObject = Record<string, unknown>;

function safeErrorDetails(error: unknown): {
  code: string;
  name: string;
  stack: string;
  status: string;
} {
  const candidate = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const stack =
    error instanceof Error
      ? (error.stack
          ?.split("\n")
          .filter(
            (line) =>
              line.includes("/src/features/seo/") ||
              line.includes("/src/lib/supabase/") ||
              line.includes("@supabase/"),
          )
          .slice(0, 4)
          .join(" | ") ?? "")
      : "";

  return {
    code: typeof candidate.code === "string" ? candidate.code : "unknown",
    name: error instanceof Error ? error.name : "UnknownError",
    stack,
    status:
      typeof candidate.status === "number" || typeof candidate.status === "string"
        ? String(candidate.status)
        : "unknown",
  };
}

function logSeoFailure(operation: string, error: unknown): void {
  const details = safeErrorDetails(error);
  console.error(
    `[seo] operation=${operation} status=error name=${details.name} code=${details.code} status_code=${details.status}`,
  );
  if (details.stack) console.error(`[seo] operation=${operation} stack=${details.stack}`);
}

function object(value: unknown): RawObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawObject) : null;
}

function string(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function faqList(value: unknown): SeoFaq[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const row = object(item);
        const question = string(row?.question);
        const answer = string(row?.answer);
        return question && answer ? [{ answer, question }] : [];
      })
    : [];
}

function routeList(value: unknown): SeoRoute[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const row = object(item);
        const label = string(row?.label);
        const description = string(row?.description);
        return label && description ? [{ description, label }] : [];
      })
    : [];
}

async function fetchPublicCityPage(locale: AppLocale, slug: string): Promise<CitySeoPage | null> {
  let supabase;
  try {
    console.info(`[seo] operation=public-city-client-init status=start locale=${locale}`);
    supabase = await createServerSupabaseClient();
    console.info(`[seo] operation=public-city-client-init status=success locale=${locale}`);
  } catch (error) {
    logSeoFailure("public-city-client-init", error);
    throw error;
  }

  let data: unknown;
  let error: unknown;
  try {
    console.info(`[seo] operation=public-city-rpc status=start locale=${locale}`);
    ({ data, error } = await supabase.rpc("get_public_city_seo_content", {
      p_locale: locale,
      p_slug: slug,
    }));
  } catch (caught) {
    logSeoFailure("public-city-rpc", caught);
    throw caught;
  }

  if (error) logSeoFailure("public-city-rpc", error);
  const row = object(data);
  if (error || !row) return null;
  const required = {
    cityId: string(row.city_id),
    cityName: string(row.city_name),
    id: string(row.id),
    introduction: string(row.introduction),
    metaDescription: string(row.meta_description),
    pageHeading: string(row.page_heading),
    regionName: string(row.region_name),
    seoTitle: string(row.seo_title),
    serviceAreaContent: string(row.service_area_content),
    slug: string(row.slug),
    updatedAt: string(row.updated_at),
  };
  if (Object.values(required).some((value) => !value)) return null;
  const alternateRows = object(row.alternates) ?? {};
  return {
    alternates: {
      ar: string(alternateRows.ar) ?? undefined,
      en: string(alternateRows.en) ?? undefined,
    },
    cityId: required.cityId!,
    cityName: required.cityName!,
    faqs: faqList(row.faqs),
    id: required.id!,
    indexable: row.is_indexable === true,
    introduction: required.introduction!,
    locale,
    metaDescription: required.metaDescription!,
    neighborhoodCoverage: string(row.neighborhood_coverage_text),
    pageHeading: required.pageHeading!,
    regionName: required.regionName!,
    routes: routeList(row.routes),
    seoTitle: required.seoTitle!,
    serviceAreaContent: required.serviceAreaContent!,
    slug: required.slug!,
    updatedAt: required.updatedAt!,
  };
}

export const getPublicCitySeoPage = cache(fetchPublicCityPage);

async function fetchCityIndex(locale?: AppLocale): Promise<CitySeoIndexItem[]> {
  let supabase;
  try {
    console.info(`[seo] operation=index-client-init status=start locale=${locale ?? "all"}`);
    supabase = await createServerSupabaseClient();
    console.info(`[seo] operation=index-client-init status=success locale=${locale ?? "all"}`);
  } catch (error) {
    logSeoFailure("index-client-init", error);
    throw error;
  }

  let data: unknown;
  let error: unknown;
  try {
    console.info(`[seo] operation=index-rpc status=start locale=${locale ?? "all"}`);
    ({ data, error } = await supabase.rpc("get_indexable_city_seo_index", {
      p_locale: locale ?? null,
    }));
  } catch (caught) {
    logSeoFailure("index-rpc", caught);
    throw caught;
  }

  if (error) logSeoFailure("index-rpc", error);
  if (error || !Array.isArray(data)) return [];
  console.info(
    `[seo] operation=index-rpc status=success locale=${locale ?? "all"} rows=${data.length}`,
  );
  return data.flatMap((item) => {
    const row = object(item);
    const cityId = string(row?.city_id);
    const cityName = string(row?.city_name);
    const itemLocale = string(row?.locale);
    const regionName = string(row?.region_name);
    const slug = string(row?.slug);
    const updatedAt = string(row?.updated_at);
    return cityId &&
      cityName &&
      (itemLocale === "ar" || itemLocale === "en") &&
      regionName &&
      slug &&
      updatedAt
      ? [{ cityId, cityName, locale: itemLocale, regionName, slug, updatedAt }]
      : [];
  });
}

export const getIndexableCitySeoIndex = cache(fetchCityIndex);

function parseAdminItem(value: unknown): AdminCitySeoItem | null {
  const row = object(value);
  if (!row) return null;
  const locale = string(row.locale);
  const cityStatus = string(row.city_status);
  const contentStatus = string(row.content_status);
  if (
    (locale !== "ar" && locale !== "en") ||
    (cityStatus !== "active" && cityStatus !== "inactive") ||
    !["draft", "ready", "published"].includes(contentStatus ?? "")
  )
    return null;
  const id = string(row.id);
  const cityId = string(row.city_id);
  const cityCode = string(row.city_code);
  const cityNameAr = string(row.city_name_ar);
  const cityNameEn = string(row.city_name_en);
  const slug = string(row.slug);
  const updatedAt = string(row.updated_at);
  const version = typeof row.version === "number" ? row.version : null;
  if (!id || !cityId || !cityCode || !cityNameAr || !cityNameEn || !slug || !updatedAt || !version)
    return null;
  return {
    cityCode,
    cityId,
    cityNameAr,
    cityNameEn,
    cityStatus,
    contentStatus: contentStatus as AdminCitySeoItem["contentStatus"],
    faqs: faqList(row.faqs),
    id,
    indexable: row.is_indexable === true,
    introduction: string(row.introduction),
    locale,
    metaDescription: string(row.meta_description),
    neighborhoodCoverage: string(row.neighborhood_coverage_text),
    pageHeading: string(row.page_heading),
    readinessIssues: Array.isArray(row.readiness_issues)
      ? row.readiness_issues.filter((item): item is string => typeof item === "string")
      : [],
    routes: routeList(row.routes),
    seoTitle: string(row.seo_title),
    serviceAreaContent: string(row.service_area_content),
    slug,
    updatedAt,
    version,
  };
}

export async function getAdminCitySeoContents(): Promise<AdminCitySeoPayload> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_city_seo_contents");
  const payload = object(data);
  if (error || !payload || !Array.isArray(payload.items)) throw new Error("SEO_ADMIN_UNAVAILABLE");
  return { items: payload.items.flatMap((item) => parseAdminItem(item) ?? []) };
}

export async function updateAdminCitySeoContent(input: {
  content: string;
  expectedVersion: number;
  faqs: SeoFaq[];
  introduction: string;
  metaDescription: string;
  neighborhoodCoverage: string;
  pageHeading: string;
  routes: SeoRoute[];
  seoTitle: string;
  serviceAreaContent: string;
  slug: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_upsert_city_seo_content", {
    p_content: input.content,
    p_expected_version: input.expectedVersion,
    p_faqs: input.faqs as Json,
    p_introduction: input.introduction,
    p_meta_description: input.metaDescription,
    p_neighborhood_coverage_text: input.neighborhoodCoverage,
    p_page_heading: input.pageHeading,
    p_routes: input.routes as Json,
    p_seo_title: input.seoTitle,
    p_service_area_content: input.serviceAreaContent,
    p_slug: input.slug,
  });
  if (error) throw new Error("SEO_CONTENT_UPDATE_FAILED", { cause: error });
}

export async function setAdminCitySeoState(input: {
  content: string;
  indexable: boolean;
  status: "draft" | "published" | "ready";
}) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_set_city_seo_state", {
    p_content: input.content,
    p_indexable: input.indexable,
    p_status: input.status,
  });
  if (error) throw new Error("SEO_STATE_UPDATE_FAILED", { cause: error });
}
