import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { emailSchema, passwordSchema, signUpSchema } from "@/features/unified-auth/lib/validation";
import { getSafeRedirectPath } from "@/lib/auth/redirects";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("customer password authentication", () => {
  it("requires strong password input without creating another password store", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("twelveletters1!").success).toBe(true);
    expect(source("src/features/unified-auth/components/sign-up-form.tsx")).toContain(
      "supabase.auth.signUp",
    );
    expect(source("src/features/unified-auth/components/reset-password-form.tsx")).toContain(
      'fetch("/auth/recovery/reset"',
    );
    expect(source("src/app/auth/recovery/reset/route.ts")).toContain("supabase.auth.updateUser");
  });

  it("validates customer signup and explicit privacy acknowledgement", () => {
    const valid = {
      displayName: "Test Customer",
      email: "customer@example.com",
      password: "SafePassword1!",
      passwordConfirmation: "SafePassword1!",
      privacyAccepted: true,
    } as const;
    expect(signUpSchema.safeParse(valid).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, privacyAccepted: false }).success).toBe(false);
    expect(
      signUpSchema.safeParse({ ...valid, passwordConfirmation: "Different1!Password" }).success,
    ).toBe(false);
  });

  it("normalizes email and returns a generic recovery response", () => {
    expect(emailSchema.parse(" Customer@Example.com ")).toBe("customer@example.com");
    const form = source("src/features/unified-auth/components/forgot-password-form.tsx");
    expect(form).toContain("resetPasswordForEmail");
    expect(form).toContain("createPasswordRecoveryCallbackUrl");
    expect(form).toContain("t.forgotSuccess");
    expect(form).not.toContain("user exists");
  });

  it("prevents redirect manipulation", () => {
    expect(getSafeRedirectPath("//attacker.example")).toBe("/");
    expect(getSafeRedirectPath("/%2f%2fattacker.example")).toBe("/");
    expect(getSafeRedirectPath("/en/account")).toBe("/en/account");
  });

  it("does not derive customer or Staff email callbacks from an unvalidated browser origin", () => {
    for (const file of [
      "src/features/unified-auth/components/sign-up-form.tsx",
      "src/features/unified-auth/components/forgot-password-form.tsx",
      "src/features/unified-auth/components/unified-login-form.tsx",
      "src/features/staff-auth/components/staff-sign-in-form.tsx",
      "src/features/staff-portal/actions/administration.actions.ts",
    ]) {
      expect(source(file)).not.toContain("window.location.origin");
    }
    expect(source("src/app/[locale]/signup/page.tsx")).toContain("getRequestAuthRedirectOrigin");
    expect(source("src/app/[locale]/forgot-password/page.tsx")).toContain(
      "getRequestAuthRedirectOrigin",
    );
    expect(source("src/app/[locale]/login/page.tsx")).toContain("getRequestAuthRedirectOrigin");
  });

  it("never derives Staff authorization from customer metadata", () => {
    const migration = source(
      "supabase/migrations/20260815170000_auth_visual_public_projection.sql",
    );
    expect(migration).toContain("v_metadata->>'display_name'");
    expect(migration).toContain("v_metadata->>'preferred_locale'");
    expect(migration).not.toMatch(/v_metadata[^\n]*(role|permission)/i);
    expect(migration).toContain("public.profile_roles");
    expect(migration).toContain("public.role_permissions");
  });

  it("keeps auth pages private and tokens out of application source", () => {
    const middleware = source("src/middleware.ts");
    expect(middleware).toContain("forgot-password");
    expect(middleware).toContain("reset-password");
    expect(middleware).toContain('"no-referrer"');
    for (const file of [
      "src/features/unified-auth/components/sign-up-form.tsx",
      "src/features/unified-auth/components/forgot-password-form.tsx",
      "src/features/unified-auth/components/reset-password-form.tsx",
    ]) {
      expect(source(file)).not.toMatch(
        /console\.(log|error)|service.role|access_token|refresh_token/i,
      );
    }
  });

  it("requires a verified recovery context before rendering or mutating a password", () => {
    const page = source("src/app/[locale]/reset-password/page.tsx");
    const route = source("src/app/auth/recovery/reset/route.ts");
    expect(page).toContain("PASSWORD_RECOVERY_CONTEXT_COOKIE");
    expect(page).toContain("supabase.auth.getUser");
    expect(route).toContain("PASSWORD_RECOVERY_CONTEXT_VALUE");
    expect(route).toContain("isApprovedServerAuthOrigin");
    expect(route).toContain('signOut({ scope: "local" })');
    expect(route).not.toMatch(/console\.(log|error)|access_token|refresh_token/i);
  });
});
