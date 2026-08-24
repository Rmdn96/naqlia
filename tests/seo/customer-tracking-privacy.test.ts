import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("private customer tracking", () => {
  const page = readFileSync(
    resolve(process.cwd(), "src/app/[locale]/track/[token]/page.tsx"),
    "utf8",
  );
  const middleware = readFileSync(resolve(process.cwd(), "src/middleware.ts"), "utf8");
  const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
  const sitemap = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
  it("is noindex, dynamic, and absent from sitemap", () => {
    expect(page).toContain('dynamic = "force-dynamic"');
    expect(page).toContain("follow: false");
    expect(page).toContain("index: false");
    expect(sitemap).not.toContain("/track/");
  });
  it("uses no-store and no-referrer headers", () => {
    expect(middleware).toContain('"Cache-Control", "private, no-store, max-age=0"');
    expect(middleware).toContain('"Referrer-Policy", "no-referrer"');
    expect(middleware).toContain('"X-Robots-Tag", "noindex, nofollow, noarchive"');
    expect(nextConfig).toContain('source: "/:locale(ar|en)/track/:path*"');
    expect(nextConfig).toContain('{ key: "Referrer-Policy", value: "no-referrer" }');
  });
});
