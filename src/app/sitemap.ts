import type { MetadataRoute } from "next";

import { getMetadataBase } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getMetadataBase();
  const routes = ["", "/request", "/privacy"];

  return ["ar", "en"].flatMap((locale) =>
    routes.map((route) => ({
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      lastModified: new Date(),
      priority: route === "" ? 1 : route === "/request" ? 0.9 : 0.5,
      url: new URL(`/${locale}${route}`, base).toString(),
    })),
  );
}
