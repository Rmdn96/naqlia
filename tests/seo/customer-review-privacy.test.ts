import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("customer Review privacy", () => {
  const page = readFileSync(
    resolve(process.cwd(), "src/app/[locale]/track/[token]/page.tsx"),
    "utf8",
  );
  const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
  const sitemap = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
  const form = readFileSync(
    resolve(process.cwd(), "src/features/reviews-quality/components/customer-review-form.tsx"),
    "utf8",
  );
  it("inherits the dynamic noindex/no-referrer/no-store Tracking boundary", () => {
    expect(page).toContain('dynamic = "force-dynamic"');
    expect(page).toContain("follow: false");
    expect(page).toContain("index: false");
    expect(nextConfig).toContain('source: "/:locale(ar|en)/track/:path*"');
    expect(nextConfig).toContain('value: "no-referrer"');
    expect(nextConfig).toContain('value: "private, no-store, max-age=0"');
    expect(sitemap).not.toContain("/track/");
  });
  it("renders Arabic and English without putting the capability in the Google URL", () => {
    expect(form).toContain("كيف كانت تجربتك مع نقلك؟");
    expect(form).toContain("How was your experience with Naqlk?");
    expect(form).toContain("href={googleReviewUrl}");
    expect(form).not.toMatch(/googleReviewUrl[^\n]+token/);
  });
});
