"use client";

import { isOAuthProviderEnabled } from "@/config/auth";
import { createAuthCallbackUrl } from "@/lib/auth/redirect-origin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types/auth";

export async function beginOAuthSignIn(
  provider: OAuthProvider,
  authOrigin: string,
  locale: "ar" | "en",
  nextPath?: string,
) {
  if (!isOAuthProviderEnabled(provider)) {
    throw new Error(`OAuth provider is not enabled: ${provider}`);
  }

  const callbackUrl = createAuthCallbackUrl(authOrigin, locale, nextPath);

  const supabase = createBrowserSupabaseClient();

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
    },
  });
}
