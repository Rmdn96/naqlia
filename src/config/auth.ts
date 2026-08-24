import type { OAuthProvider, SupportedAuthMethod } from "@/types/auth";

export const AUTH_CALLBACK_PATH = "/auth/callback";
export const DEFAULT_AFTER_AUTH_PATH = "/";
export const PASSWORD_RECOVERY_CONTEXT_COOKIE = "naqlk-password-recovery";
export const PASSWORD_RECOVERY_CONTEXT_MAX_AGE_SECONDS = 15 * 60;
export const PASSWORD_RECOVERY_CONTEXT_VALUE = "verified";
export const PASSWORD_RECOVERY_RESET_INTENT_HEADER = "x-naqlk-password-reset";
export const PASSWORD_RECOVERY_RESET_INTENT_VALUE = "same-origin";

export const SUPPORTED_AUTH_METHODS = [
  "guest",
  "email",
  "google",
  "apple",
] as const satisfies readonly SupportedAuthMethod[];

export function isOAuthProviderEnabled(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  }

  return process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true";
}
