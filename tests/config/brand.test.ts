import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  BRAND,
  getBrandName,
  getBrandTagline,
  getLocaleAlternates,
  getOrganizationStructuredData,
} from "@/config/brand";
import { getMetadataBase } from "@/config/site";
import { routing } from "@/i18n/routing";

describe("Naqlk brand authority", () => {
  it("provides the approved Arabic and English identity", () => {
    expect(getBrandName("ar")).toBe("نقلك");
    expect(getBrandName("en")).toBe("Naqlk");
    expect(getBrandTagline("ar")).toBe("نقلك... ننقل كل ما يهمك");
    expect(getBrandTagline("en")).toBe("Your move. Everything that matters.");
    expect(BRAND.abbreviation).toBe("NQ");
  });

  it("keeps Arabic as the default locale with English available", () => {
    expect(routing.defaultLocale).toBe("ar");
    expect(routing.localeDetection).toBe(false);
    expect(routing.locales).toEqual(["ar", "en"]);
  });

  it("always emits the production canonical origin in previews", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://preview.example.vercel.app");
    vi.stubEnv("VERCEL_URL", "preview.example.vercel.app");

    expect(getMetadataBase().toString()).toBe("https://naqlk.com/");

    vi.unstubAllEnvs();
  });

  it("defines localized canonicals and Arabic x-default", () => {
    expect(getLocaleAlternates("en", "/request")).toEqual({
      canonical: "/en/request",
      languages: { ar: "/ar/request", en: "/en/request", "x-default": "/ar/request" },
    });
  });

  it("publishes localized organization JSON-LD", () => {
    expect(getOrganizationStructuredData("ar")).toMatchObject({
      "@type": "Organization",
      alternateName: "Naqlk",
      name: "نقلك",
      slogan: "نقلك... ننقل كل ما يهمك",
      url: "https://naqlk.com",
    });
  });

  it("uses the configured localized Open Graph site name", () => {
    const homepage = readFileSync(resolve(process.cwd(), "src/app/[locale]/page.tsx"), "utf8");
    expect(homepage).toContain("siteName: getBrandName(locale)");
    expect(homepage).toContain("url: `/${locale}`");
  });
});
