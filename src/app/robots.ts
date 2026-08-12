import type { MetadataRoute } from "next";

import { BRAND } from "@/config/brand";
import { getMetadataBase } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: BRAND.domains.activeProductionOrigin,
    rules: [
      { allow: ["/ar", "/ar/", "/en", "/en/"], disallow: ["/*/request/success"], userAgent: "*" },
    ],
    sitemap: new URL("/sitemap.xml", getMetadataBase()).toString(),
  };
}
