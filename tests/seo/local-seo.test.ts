import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { BRAND } from "@/config/brand";
import { getServiceSeoPage, SERVICE_PAGE_SLUGS } from "@/features/seo/content/service-pages";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("SEO and Local SEO runtime", () => {
  it("provides four unique substantive service pages in both locales", () => {
    expect(SERVICE_PAGE_SLUGS).toHaveLength(4);
    for (const locale of ["ar", "en"] as const) {
      const pages = SERVICE_PAGE_SLUGS.map((slug) => getServiceSeoPage(locale, slug));
      expect(new Set(pages.map((page) => page?.title)).size).toBe(4);
      expect(
        pages.every((page) => page && page.faqs.length >= 2 && page.introduction.length > 140),
      ).toBe(true);
    }
  });

  it("keeps fixed canonical origin and localized alternates", () => {
    const city = read("src/app/[locale]/[citySlug]/page.tsx");
    const service = read("src/app/[locale]/services/[serviceSlug]/page.tsx");
    expect(BRAND.domains.activeProductionOrigin).toBe("https://naqlk.vercel.app");
    expect(city).toContain("ACTIVE_PRODUCTION_ORIGIN");
    expect(city).toContain('languages["x-default"]');
    expect(service).toContain("getLocaleAlternates");
    expect(city).not.toContain("VERCEL_URL");
  });

  it("generates sitemap from explicit publication readiness and excludes private surfaces", () => {
    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");
    expect(sitemap).toContain("getIndexableCitySeoIndex");
    expect(sitemap).toContain("SERVICE_PAGE_SLUGS");
    expect(sitemap).not.toMatch(/quote|dashboard|account/);
    expect(robots).toContain('"/*/quote"');
    expect(robots).toContain('"/*/track"');
    expect(robots).toContain('"/*/account"');
  });

  it("sanitizes JSON-LD and keeps visible FAQ data aligned", () => {
    const component = read("src/features/seo/components/structured-data.tsx");
    const city = read("src/app/[locale]/[citySlug]/page.tsx");
    expect(component).toContain('replace(/</g, "\\\\u003c")');
    expect(city).toContain('"@type": "FAQPage"');
    expect(city).toContain("<FaqSection");
  });

  it("enforces Super Admin mutation permission and safe request prefilling", () => {
    const action = read("src/features/seo/actions/seo.actions.ts");
    const request = read("src/app/[locale]/request/page.tsx");
    expect(action).toContain('permissions.includes("settings.seo.manage")');
    expect(action).toContain("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    expect(request).toContain("initialCityId");
    expect(request).toContain("initialServiceId");
  });
});
