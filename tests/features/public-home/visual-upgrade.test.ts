import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Naqlk public visual upgrade", () => {
  it("ships code-native marks and optimized original hero formats", () => {
    for (const asset of [
      "public/brand/naqlk-mark.svg",
      "public/brand/naqlk-mark-light.svg",
      "public/brand/naqlk-horizontal-ar.svg",
      "public/brand/naqlk-horizontal-en.svg",
      "public/images/naqlk-moving-hero.avif",
      "public/images/naqlk-moving-hero.webp",
      "public/images/naqlk-moving-hero-branded.avif",
      "public/images/naqlk-moving-hero-branded.webp",
    ])
      expect(existsSync(resolve(process.cwd(), asset)), asset).toBe(true);
    expect(
      statSync(resolve(process.cwd(), "public/images/naqlk-moving-hero-branded.avif")).size,
    ).toBeLessThan(150_000);
  });

  it("uses real HTML for hero content and an optimized responsive image", () => {
    const homepage = source("src/app/[locale]/page.tsx");
    const styles = source("src/styles/globals.css");
    expect(homepage).toContain("<h1");
    expect(homepage).toContain('src="/images/naqlk-moving-hero-branded.avif"');
    expect(homepage).toContain("priority");
    expect(homepage).toContain('sizes="100vw"');
    expect(homepage).toContain('dir="ltr"');
    expect(homepage).toContain('dir={locale === "ar" ? "rtl" : "ltr"}');
    expect(homepage).toContain("lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]");
    expect(homepage).toContain("lg:col-start-1");
    expect(homepage).toContain("bg-transparent");
    expect(homepage).toContain("heroTrust.map");
    expect(styles).toContain("@media (min-width: 768px)");
    expect(styles).toContain("hsl(216 79% 16% / 0) 62%");
    expect(styles).not.toContain('[dir="rtl"] .hero-overlay');
  });

  it("uses authoritative public projections without fabricated reviews or cities", () => {
    const service = source("src/features/public-home/services/public-home.service.ts");
    const migration = source(
      "supabase/migrations/20260815170000_auth_visual_public_projection.sql",
    );
    expect(service).toContain('supabase.rpc("get_public_homepage_content"');
    expect(migration).toContain("r.publication_status='published'");
    expect(migration).toContain("r.publication_consent");
    expect(migration).toContain("c.status='active'");
    expect(migration).not.toContain("reference_number");
  });

  it("preserves Arabic-first localization and hides empty review content", () => {
    const layout = source("src/app/[locale]/layout.tsx");
    const homepage = source("src/app/[locale]/page.tsx");
    expect(layout).toContain('locale === "ar" ? "rtl" : "ltr"');
    expect(homepage).toContain("publicContent.reviews.length ?");
    expect(homepage).toContain('id="service-areas"');
  });

  it("states the approved Riyadh-local and Riyadh-origin intercity scope", () => {
    const arabic = JSON.parse(source("messages/ar.json"));
    const english = JSON.parse(source("messages/en.json"));
    const publicRequestCatalog = source(
      "src/features/public-request/services/public-request.service.ts",
    );

    expect(arabic.Home.subtitle).toContain("داخل الرياض");
    expect(arabic.Home.subtitle).toContain("من الرياض إلى المدن المتاحة");
    expect(arabic.Home.subtitle).not.toContain("داخل المدن وبين مدن المملكة");
    expect(english.Home.subtitle).toContain("within Riyadh");
    expect(english.Home.subtitle).toContain("from Riyadh to supported Saudi cities");
    expect(english.Home.subtitle).not.toContain("within and between Saudi cities");
    expect(publicRequestCatalog).toContain("LAUNCH_SCOPE_SERVICE_DESCRIPTIONS");
    expect(publicRequestCatalog).toContain("نقل الأثاث داخل الرياض");
    expect(publicRequestCatalog).toContain("Furniture transport within Riyadh");
  });
});
