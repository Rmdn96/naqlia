import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";

function safeNext(next?: string): string | null {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export async function resolveAuthenticatedDestination(
  supabase: SupabaseClient<Database>,
  locale: AppLocale,
  next?: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("resolve_identity_context");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("IDENTITY_CONTEXT_UNAVAILABLE");
  }
  const context = data as { is_staff?: boolean; state?: string };
  if (context.state !== "active") throw new Error("IDENTITY_INACTIVE");
  const requested = safeNext(next);
  const staffPath =
    requested &&
    /^\/(ar|en)\/(dashboard|sales|operations|quality|finance|settings|admin)(?:\/|$)/.test(
      requested,
    );
  if (requested && (!staffPath || context.is_staff)) return requested;
  return context.is_staff ? `/${locale}/dashboard` : `/${locale}/account`;
}

export function createAuthCallbackUrl(locale: AppLocale, next?: string, recovery = false) {
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("locale", locale);
  if (next?.startsWith("/") && !next.startsWith("//")) callback.searchParams.set("next", next);
  if (recovery) callback.searchParams.set("recovery", "true");
  return callback.toString();
}
