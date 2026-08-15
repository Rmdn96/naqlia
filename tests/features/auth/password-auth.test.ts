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
      "supabase.auth.updateUser",
    );
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
    expect(form).toContain("t.forgotSuccess");
    expect(form).not.toContain("user exists");
  });

  it("prevents redirect manipulation", () => {
    expect(getSafeRedirectPath("//attacker.example")).toBe("/");
    expect(getSafeRedirectPath("/%2f%2fattacker.example")).toBe("/");
    expect(getSafeRedirectPath("/en/account")).toBe("/en/account");
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
});
