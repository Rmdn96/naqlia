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
    ])
      expect(existsSync(resolve(process.cwd(), asset)), asset).toBe(true);
    expect(
      statSync(resolve(process.cwd(), "public/images/naqlk-moving-hero.avif")).size,
    ).toBeLessThan(150_000);
  });

  it("uses real HTML for hero content and an optimized responsive image", () => {
    const homepage = source("src/app/[locale]/page.tsx");
    expect(homepage).toContain("<h1");
    expect(homepage).toContain('src="/images/naqlk-moving-hero.avif"');
    expect(homepage).toContain("priority");
    expect(homepage).toContain('sizes="100vw"');
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
});
