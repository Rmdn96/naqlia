"use client";

import { AUTH_CALLBACK_PATH, isOAuthProviderEnabled } from "@/config/auth";
import { getApplicationUrl } from "@/config/env";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/types/auth";

export async function beginOAuthSignIn(provider: OAuthProvider, nextPath?: string) {
  if (!isOAuthProviderEnabled(provider)) {
    throw new Error(`OAuth provider is not enabled: ${provider}`);
  }

  const callbackUrl = new URL(AUTH_CALLBACK_PATH, getApplicationUrl());
  callbackUrl.searchParams.set("next", getSafeRedirectPath(nextPath));

  const supabase = createBrowserSupabaseClient();

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });
}
