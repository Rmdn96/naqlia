import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

const { citySlugs } = vi.hoisted(() => ({
  citySlugs: [
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
  ],
}));

vi.mock("@/features/seo/services/seo.service", () => ({
  getIndexableCitySeoIndex: vi.fn().mockResolvedValue(
    citySlugs.flatMap((slug, cityIndex) =>
      ["ar", "en"].map((locale) => ({
        cityId: `city-${cityIndex}`,
        cityName: slug,
        locale,
        regionName: "Saudi Arabia",
        slug,
        updatedAt: "2026-08-22T18:00:00.000Z",
      })),
    ),
  ),
}));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { BRAND } from "@/config/brand";

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(path, entry.name);
    return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath];
  });
}

describe("Naqlk SEO identity", () => {
  it("uses the canonical origin for every sitemap entry", async () => {
    const entries = await sitemap();
    expect(entries).toHaveLength(58);
    expect(
      entries.every(({ url }) => url.startsWith(`${BRAND.domains.activeProductionOrigin}/`)),
    ).toBe(true);
  });

  it("includes a reciprocal locale pair for every published city at editorial scale", async () => {
    const urls = new Set((await sitemap()).map(({ url }) => url));
    for (const slug of citySlugs) {
      expect(urls.has(`https://naqlk.vercel.app/ar/${slug}`)).toBe(true);
      expect(urls.has(`https://naqlk.vercel.app/en/${slug}`)).toBe(true);
    }
  });

  it("publishes the canonical sitemap and host through robots", () => {
    expect(robots()).toMatchObject({
      host: "https://naqlk.vercel.app",
      sitemap: "https://naqlk.vercel.app/sitemap.xml",
    });
  });

  it("does not promote the future or preview domain into active SEO output", async () => {
    expect(BRAND.domains.activeProductionOrigin).toBe("https://naqlk.vercel.app");
    expect(BRAND.domains.futureCustomDomain).toBe("https://naqlk.com");
    expect(
      (await sitemap()).some(({ url }) => url.startsWith(BRAND.domains.futureCustomDomain)),
    ).toBe(false);
  });

  it("uses Naqlk in both WhatsApp templates", () => {
    const english = JSON.parse(readFileSync(resolve(process.cwd(), "messages/en.json"), "utf8"));
    const arabic = JSON.parse(readFileSync(resolve(process.cwd(), "messages/ar.json"), "utf8"));
    expect(english.Success.whatsappMessage).toContain("Naqlk");
    expect(english.Success.trackingMessage).toContain("Naqlk");
    expect(arabic.Success.whatsappMessage).toContain("نقلك");
    expect(arabic.Success.trackingMessage).toContain("نقلك");
  });

  it("contains no former customer-facing brand in runtime content", () => {
    const runtimeFiles = [
      ...sourceFiles(resolve(process.cwd(), "src")),
      ...sourceFiles(resolve(process.cwd(), "messages")),
    ];

    for (const file of runtimeFiles) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/Naqlia|نقلية/);
    }
  });
});
