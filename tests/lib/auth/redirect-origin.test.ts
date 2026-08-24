import { describe, expect, it } from "vitest";

import {
  createAuthCallbackUrl,
  createPasswordRecoveryCallbackUrl,
  isApprovedAuthRedirectOrigin,
  resolveAuthRedirectOrigin,
  type AuthRedirectEnvironment,
} from "@/lib/auth/redirect-origin";

const production = "https://naqlk.vercel.app";
const branchPreview = "https://naqlk-git-feature-auth-visual-upgrade-mohamed-ramadan.vercel.app";
const deploymentPreview = "https://naqlk-example-mohamed-ramadan.vercel.app";

function previewEnvironment(
  overrides: Partial<AuthRedirectEnvironment> = {},
): AuthRedirectEnvironment {
  return {
    applicationUrl: production,
    approvedPreviewOrigin: branchPreview,
    nodeEnvironment: "production",
    vercelBranchUrl: new URL(branchPreview).hostname,
    vercelEnvironment: "preview",
    vercelUrl: new URL(deploymentPreview).hostname,
    ...overrides,
  };
}

describe("authentication redirect origin", () => {
  it("maps an immutable Preview request to the approved branch Preview callback", () => {
    expect(resolveAuthRedirectOrigin(deploymentPreview, previewEnvironment())).toBe(branchPreview);
  });

  it("keeps an approved branch Preview request on that Preview", () => {
    expect(resolveAuthRedirectOrigin(branchPreview, previewEnvironment())).toBe(branchPreview);
  });

  it("accepts only explicit Preview aliases for state-changing Auth requests", () => {
    expect(isApprovedAuthRedirectOrigin(branchPreview, previewEnvironment())).toBe(true);
    expect(isApprovedAuthRedirectOrigin(deploymentPreview, previewEnvironment())).toBe(true);
    expect(isApprovedAuthRedirectOrigin("https://attacker.example", previewEnvironment())).toBe(
      false,
    );
    expect(
      isApprovedAuthRedirectOrigin(
        "https://naqlk-example-mohamed-ramadan.vercel.app.attacker.example",
        previewEnvironment(),
      ),
    ).toBe(false);
  });

  it.each([
    "https://attacker.example",
    "https://naqlk-example-mohamed-ramadan.vercel.app.attacker.example",
    "javascript:alert(1)",
    "https://user:password@naqlk.vercel.app",
    "https://naqlk.vercel.app/unsafe",
  ])("rejects a crafted origin and falls back to production: %s", (origin) => {
    expect(resolveAuthRedirectOrigin(origin, previewEnvironment())).toBe(production);
  });

  it("never accepts Preview origins in the production environment", () => {
    expect(
      resolveAuthRedirectOrigin(deploymentPreview, {
        ...previewEnvironment(),
        vercelEnvironment: "production",
      }),
    ).toBe(production);
  });

  it("supports only approved local development origins", () => {
    const environment: AuthRedirectEnvironment = {
      applicationUrl: "http://localhost:3000",
      nodeEnvironment: "development",
    };
    expect(resolveAuthRedirectOrigin("http://127.0.0.1:3000", environment)).toBe(
      "http://127.0.0.1:3000",
    );
    expect(resolveAuthRedirectOrigin("http://localhost:4000", environment)).toBe(
      "http://localhost:3000",
    );
  });

  it("preserves locale and recovery state while sanitizing the destination", () => {
    const callback = new URL(
      createAuthCallbackUrl(branchPreview, "ar", "//attacker.example", true),
    );
    expect(callback.origin).toBe(branchPreview);
    expect(callback.pathname).toBe("/auth/callback");
    expect(callback.searchParams.get("locale")).toBe("ar");
    expect(callback.searchParams.get("next")).toBe("/");
    expect(callback.searchParams.get("recovery")).toBe("true");
  });

  it.each(["ar", "en"] as const)(
    "builds a dedicated %s recovery callback on the approved Preview origin",
    (locale) => {
      const callback = new URL(createPasswordRecoveryCallbackUrl(branchPreview, locale));
      expect(callback.origin).toBe(branchPreview);
      expect(callback.pathname).toBe("/auth/callback");
      expect(callback.searchParams.get("locale")).toBe(locale);
      expect(callback.searchParams.get("next")).toBe(`/${locale}/reset-password`);
      expect(callback.searchParams.get("recovery")).toBe("true");
    },
  );

  it("builds Production recovery callbacks without depending on a Preview hostname", () => {
    const callback = new URL(createPasswordRecoveryCallbackUrl(production, "ar"));
    expect(callback.origin).toBe(production);
    expect(callback.pathname).toBe("/auth/callback");
  });
});
