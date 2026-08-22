import type { AppLocale } from "@/i18n/routing";

export type SeoFaq = { answer: string; question: string };
export type SeoRoute = { description: string; label: string };

export type CitySeoPage = {
  alternates: Partial<Record<AppLocale, string>>;
  cityId: string;
  cityName: string;
  faqs: SeoFaq[];
  id: string;
  indexable: boolean;
  introduction: string;
  locale: AppLocale;
  metaDescription: string;
  neighborhoodCoverage: string | null;
  pageHeading: string;
  regionName: string;
  routes: SeoRoute[];
  seoTitle: string;
  serviceAreaContent: string;
  slug: string;
  updatedAt: string;
};

export type CitySeoIndexItem = {
  cityId: string;
  cityName: string;
  locale: AppLocale;
  regionName: string;
  slug: string;
  updatedAt: string;
};

export type AdminCitySeoItem = {
  cityCode: string;
  cityId: string;
  cityNameAr: string;
  cityNameEn: string;
  cityStatus: "active" | "inactive";
  contentStatus: "draft" | "published" | "ready";
  faqs: SeoFaq[];
  id: string;
  indexable: boolean;
  introduction: string | null;
  locale: AppLocale;
  metaDescription: string | null;
  neighborhoodCoverage: string | null;
  pageHeading: string | null;
  readinessIssues: string[];
  routes: SeoRoute[];
  seoTitle: string | null;
  serviceAreaContent: string | null;
  slug: string;
  updatedAt: string;
  version: number;
};

export type AdminCitySeoPayload = { items: AdminCitySeoItem[] };

export type ServicePageSlug =
  "furniture-moving" | "goods-transport" | "intercity-transport" | "within-city-transport";

export type ServiceSeoPage = {
  benefits: string[];
  description: string;
  faqs: SeoFaq[];
  heading: string;
  introduction: string;
  key: string;
  locale: AppLocale;
  metaDescription: string;
  process: string[];
  slug: ServicePageSlug;
  title: string;
};
