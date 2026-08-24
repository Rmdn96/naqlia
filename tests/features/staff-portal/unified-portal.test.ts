import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { isStaffPath } from "@/lib/auth/identity-context";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Unified Account and Staff Portal application contract", () => {
  it("recognizes every protected Staff Portal area", () => {
    for (const area of [
      "dashboard",
      "sales",
      "operations",
      "quality",
      "finance",
      "settings",
      "admin",
    ]) {
      expect(isStaffPath(`/ar/${area}`)).toBe(true);
      expect(isStaffPath(`/en/${area}/nested`)).toBe(true);
    }
    expect(isStaffPath("/ar/account")).toBe(false);
  });

  it("uses password login and shows Google only from its availability flag", () => {
    const loginPage = source("src/app/[locale]/login/page.tsx");
    const form = source("src/features/unified-auth/components/unified-login-form.tsx");
    expect(loginPage).toContain('isOAuthProviderEnabled("google")');
    expect(form).toContain("googleEnabled ?");
    expect(form).toContain("signInWithPassword");
    expect(form).not.toContain("appleEnabled");
    expect(form).not.toContain("signInWithOtp");
  });

  it("routes authorization after authentication through the server-authoritative resolver", () => {
    const callback = source("src/app/auth/callback/route.ts");
    expect(callback).toContain('supabase.rpc("resolve_identity_context")');
    expect(callback).toContain("isStaffPath(requestedPath)");
    expect(callback).toContain("supabase.auth.verifyOtp");
    expect(callback).toContain('["invite", "magiclink", "recovery", "signup"]');
    expect(callback).not.toMatch(/user_metadata[^\n]*(role|permission)/i);
  });

  it("uses one permission-aware responsive shell for existing workspaces", () => {
    const shell = source("src/features/staff-portal/components/staff-portal-shell.tsx");
    expect(shell).toContain('permission("sales.workspace.read")');
    expect(shell).toContain('permission("operations.workspace.read")');
    expect(shell).toContain('permission("quality.workspace.read")');
    expect(shell).toContain('permission("finance.dashboard.read")');
    expect(shell).toContain("lg:hidden");
    expect(shell).toContain("ThemeToggle");
  });

  it("protects transactional and staff pages from indexing, caching, and referrer leakage", () => {
    const middleware = source("src/middleware.ts");
    expect(middleware).toContain('"private, no-store, max-age=0"');
    expect(middleware).toContain('"no-referrer"');
    expect(middleware).toContain('"noindex, nofollow, noarchive"');
    for (const area of [
      "account",
      "login",
      "signup",
      "forgot-password",
      "reset-password",
      "verify-email",
      "dashboard",
      "sales",
      "operations",
      "quality",
      "finance",
      "settings",
      "admin",
    ]) {
      expect(middleware).toContain(area);
    }
  });

  it("resolves public contact configuration from Business Settings with environment fallback", () => {
    const resolver = source("src/lib/business-settings/public-settings.ts");
    expect(resolver).toContain('supabase.rpc("get_public_business_settings")');
    expect(resolver).toContain("getWhatsAppNumber(values.contact_whatsapp)");
    expect(resolver).toContain("getGoogleReviewUrl(values.customer_google_review_url)");
    expect(resolver).toContain("getDefaultQuotationValidityDays()");
  });

  it("keeps capability tokens out of generic activity and public WhatsApp messages", () => {
    const account = source("src/features/customer-account/components/customer-account-view.tsx");
    const homepage = source("src/app/[locale]/page.tsx");
    expect(account).not.toMatch(/getWhatsAppHref\([^)]*(token|secureUrl)/);
    expect(homepage).not.toMatch(/wa\.me\/\d+/);
  });
});
