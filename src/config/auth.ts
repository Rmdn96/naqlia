import type { OAuthProvider, SupportedAuthMethod } from "@/types/auth";

export const AUTH_CALLBACK_PATH = "/auth/callback";
export const DEFAULT_AFTER_AUTH_PATH = "/";

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
