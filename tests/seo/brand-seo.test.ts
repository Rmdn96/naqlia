import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

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
  it("uses the canonical origin for every sitemap entry", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(6);
    expect(
      entries.every(({ url }) => url.startsWith(`${BRAND.domains.activeProductionOrigin}/`)),
    ).toBe(true);
  });

  it("publishes the canonical sitemap and host through robots", () => {
    expect(robots()).toMatchObject({
      host: "https://naqlk.vercel.app",
      sitemap: "https://naqlk.vercel.app/sitemap.xml",
    });
  });

  it("does not promote the future or preview domain into active SEO output", () => {
    expect(BRAND.domains.activeProductionOrigin).toBe("https://naqlk.vercel.app");
    expect(BRAND.domains.futureCustomDomain).toBe("https://naqlk.com");
    expect(sitemap().some(({ url }) => url.startsWith(BRAND.domains.futureCustomDomain))).toBe(
      false,
    );
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
