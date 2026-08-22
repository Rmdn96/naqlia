import "server-only";

import { unstable_cache } from "next/cache";

import type { AppLocale } from "@/i18n/routing";
import type { Json } from "@/types/database.types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
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
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_city_seo_content", {
    p_locale: locale,
    p_slug: slug,
  });
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

export const getPublicCitySeoPage = unstable_cache(fetchPublicCityPage, ["city-seo-page-v1"], {
  revalidate: 3600,
  tags: ["city-seo"],
});

async function fetchCityIndex(locale?: AppLocale): Promise<CitySeoIndexItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("get_indexable_city_seo_index", {
    p_locale: locale ?? null,
  });
  if (error || !Array.isArray(data)) return [];
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

export const getIndexableCitySeoIndex = unstable_cache(fetchCityIndex, ["city-seo-index-v1"], {
  revalidate: 3600,
  tags: ["city-seo"],
});

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
