import type { MetadataRoute } from "next";

import { getMetadataBase } from "@/config/site";
import { SERVICE_PAGE_SLUGS } from "@/features/seo/content/service-pages";
import { getIndexableCitySeoIndex } from "@/features/seo/services/seo.service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getMetadataBase();
  const routes = ["", "/request", "/privacy"];
  const cityPages = await getIndexableCitySeoIndex();
  const staticPages = ["ar", "en"].flatMap((locale) =>
    routes.map((route) => ({
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/request" ? 0.9 : 0.5,
      url: new URL(`/${locale}${route}`, base).toString(),
    })),
  );
  const servicePages = ["ar", "en"].flatMap((locale) =>
    SERVICE_PAGE_SLUGS.map((slug) => ({
      changeFrequency: "monthly" as const,
      priority: 0.8,
      url: new URL(`/${locale}/services/${slug}`, base).toString(),
    })),
  );
  const cities = cityPages.map((city) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(city.updatedAt),
    priority: 0.8,
    url: new URL(`/${city.locale}/${city.slug}`, base).toString(),
  }));
  return [...staticPages, ...servicePages, ...cities];
}
