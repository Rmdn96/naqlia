import type { MetadataRoute } from "next";

import { BRAND } from "@/config/brand";
import { getMetadataBase } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: BRAND.domains.activeProductionOrigin,
    rules: [
      {
        allow: ["/ar", "/ar/", "/en", "/en/"],
        disallow: [
          "/*/account",
          "/*/admin",
          "/*/dashboard",
          "/*/forgot-password",
          "/*/login",
          "/*/operations",
          "/*/quality",
          "/*/quote",
          "/*/request/success",
          "/*/reset-password",
          "/*/sales",
          "/*/settings",
          "/*/staff",
          "/*/track",
          "/*/verify-email",
          "/auth/",
        ],
        userAgent: "*",
      },
    ],
    sitemap: new URL("/sitemap.xml", getMetadataBase()).toString(),
  };
}
