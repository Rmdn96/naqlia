import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveSignOutLocale } from "@/lib/auth/sign-out";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("server-authoritative logout", () => {
  it("allows only fixed localized public destinations", () => {
    expect(resolveSignOutLocale("ar")).toBe("ar");
    expect(resolveSignOutLocale("en")).toBe("en");
    expect(resolveSignOutLocale("https://attacker.example")).toBe("ar");
    expect(resolveSignOutLocale(null)).toBe("ar");
  });

  it("terminates the SSR session and expires server-managed auth cookie chunks", () => {
    const server = source("src/lib/supabase/server.ts");
    expect(server).toContain('supabase.auth.signOut({ scope: "local" })');
    expect(server).toContain("createRouteHandlerSupabaseClient");
    expect(server).toContain("response.cookies.set(name, value, options)");
    expect(server).toContain("isSupabaseAuthCookie(name, url)");
    expect(server).toContain("maxAge: 0");
  });

  it("uses a no-store 303 redirect instead of stale client navigation", () => {
    const route = source("src/app/auth/sign-out/route.ts");
    expect(route).toContain("terminateRouteSupabaseSession(request, response)");
    expect(route).toContain("NextResponse.redirect");
    expect(route).toContain("303");
    expect(route).toContain("resolveServerAuthRedirectOrigin(requestOrigin)");
    expect(route).not.toContain("request.nextUrl.origin");
    expect(route).toContain('request.headers.get("sec-fetch-site") === "same-origin"');
    expect(route).toContain("getForwardedRequestOrigin(request.headers)");
    expect(route).toContain('"Cache-Control", "private, no-store, max-age=0"');
    expect(route).toContain('"Clear-Site-Data", \'"cache"\'');
  });

  it("shares the same POST boundary with Customer and Staff logout controls", () => {
    for (const file of [
      "src/components/shared/account-menu.tsx",
      "src/features/staff-auth/components/staff-sign-out-button.tsx",
    ]) {
      const contents = source(file);
      expect(contents).toContain('action="/auth/sign-out"');
      expect(contents).toContain('method="post"');
      expect(contents).not.toContain("createBrowserSupabaseClient");
    }
  });

  it("keeps Customer and Staff protected routes server-authoritative and private", () => {
    const account = source("src/app/[locale]/account/page.tsx");
    const dashboard = source("src/app/[locale]/dashboard/layout.tsx");
    const middleware = source("src/middleware.ts");
    expect(account).toContain('export const dynamic = "force-dynamic"');
    expect(account).toContain("if (!account) redirect");
    expect(dashboard).toContain("if (!context) redirect");
    expect(middleware).toContain('"Cache-Control", "private, no-store, max-age=0"');
    expect(middleware).toMatch(/account\|login[\s\S]*dashboard/);
  });
});
