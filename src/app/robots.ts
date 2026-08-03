import type { MetadataRoute } from "next";

import { getMetadataBase } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { allow: ["/ar", "/ar/", "/en", "/en/"], disallow: ["/*/request/success"], userAgent: "*" },
    ],
    sitemap: new URL("/sitemap.xml", getMetadataBase()).toString(),
  };
}
