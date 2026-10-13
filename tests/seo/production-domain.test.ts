import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { getLocaleAlternates, getOrganizationStructuredData } from "@/config/brand";
import { getMetadataBase } from "@/config/site";

const { index } = vi.hoisted(() => ({ index: vi.fn() }));
vi.mock("@/features/seo/services/seo.service", () => ({ getIndexableCitySeoIndex: index }));

const slugs = [
  "riyadh",
  "jeddah",
  "makkah",
  "madinah",
  "dammam",
  "al-khobar",
  "dhahran",
  "al-ahsa",
  "jubail",
  "taif",
  "tabuk",
  "abha",
  "khamis-mushait",
  "buraidah",
  "hail",
  "yanbu",
  "jazan",
  "najran",
  "al-kharj",
  "arar",
  "sakaka",
  "al-bahah",
];

describe("Hostinger production SEO origin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("preserves 58 eligible URLs without leaking legacy or Preview origins", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://naqlk.vercel.app");
    vi.stubEnv("VERCEL_URL", "preview.example.vercel.app");
    const updatedAt = "2026-08-22T21:30:00.000Z";
    index.mockResolvedValue(
      ["ar", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug, updatedAt }))),
    );
    const entries = await sitemap();
    expect(entries).toHaveLength(58);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(58);
    for (const entry of entries) {
      const url = new URL(entry.url);
      expect(url.origin).toBe("https://naqlk.com");
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
      expect(url.pathname).toMatch(/^\/(ar|en)(\/|$)/);
      expect(url.pathname).not.toMatch(/login|account|quote|track|auth|dashboard/);
    }
    expect(JSON.stringify(entries)).not.toContain("vercel.app");
    expect(entries.filter((entry) => entry.lastModified)).toHaveLength(44);
    expect(entries.at(-1)?.lastModified).toEqual(new Date(updatedAt));
  });

  it("does not force city inclusion when no city is eligible", async () => {
    index.mockResolvedValue([]);
    expect(await sitemap()).toHaveLength(14);
  });

  it("advertises the custom-domain sitemap and preserves private-route exclusions", () => {
    expect(robots()).toMatchObject({
      host: "https://naqlk.com",
      sitemap: "https://naqlk.com/sitemap.xml",
    });
    expect(JSON.stringify(robots().rules)).toContain("/*/account");
  });

  it("resolves reciprocal locale canonicals and Arabic x-default on the new origin", () => {
    for (const locale of ["ar", "en"] as const) {
      for (const path of ["", "/riyadh", "/services/furniture-moving"]) {
        const alternates = getLocaleAlternates(locale, path);
        expect(new URL(alternates.canonical, getMetadataBase()).href).toBe(
          `https://naqlk.com/${locale}${path}`,
        );
        expect(new URL(alternates.languages.ar, getMetadataBase()).href).toBe(
          `https://naqlk.com/ar${path}`,
        );
        expect(new URL(alternates.languages.en, getMetadataBase()).href).toBe(
          `https://naqlk.com/en${path}`,
        );
        expect(alternates.languages["x-default"]).toBe(alternates.languages.ar);
      }
      expect(getOrganizationStructuredData(locale).url).toBe("https://naqlk.com");
    }
  });
});
