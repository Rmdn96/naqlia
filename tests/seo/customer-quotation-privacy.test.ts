import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/seo/services/seo.service", () => ({
  getIndexableCitySeoIndex: vi.fn().mockResolvedValue([]),
}));

import sitemap from "@/app/sitemap";

describe("customer quotation route privacy", () => {
  it("never includes private quotation routes in the sitemap", async () => {
    expect((await sitemap()).some(({ url }) => url.includes("/quote/"))).toBe(false);
  });

  it("sets route-level noindex, nofollow, no-referrer and no-store controls", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/[locale]/quote/[token]/page.tsx"),
      "utf8",
    );
    const config = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
    expect(page).toContain("follow: false");
    expect(page).toContain("index: false");
    expect(page).not.toContain("/${token}");
    expect(config).toContain('value: "no-referrer"');
    expect(config).toContain('value: "private, no-store, max-age=0"');
    expect(config).toContain("noindex, nofollow, noarchive, nosnippet");
  });

  it("provides Arabic and English customer content and branded WhatsApp copy", () => {
    const ar = JSON.parse(readFileSync(resolve(process.cwd(), "messages/ar.json"), "utf8"));
    const en = JSON.parse(readFileSync(resolve(process.cwd(), "messages/en.json"), "utf8"));
    expect(ar.CustomerQuotation.whatsappMessage).toContain("نقلك");
    expect(en.CustomerQuotation.whatsappMessage).toContain("Naqlk");
    expect(ar.CustomerQuotation.grandTotal).toContain("الضريبة");
    expect(en.CustomerQuotation.grandTotal).toContain("VAT inclusive");
  });
});
