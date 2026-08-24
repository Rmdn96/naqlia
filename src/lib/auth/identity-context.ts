import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { IdentityContext } from "@/features/unified-auth/types/identity-context";

export async function resolveIdentityContext(): Promise<IdentityContext | null> {
  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data, error } = await supabase.rpc("resolve_identity_context");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
  const context = data as unknown as IdentityContext;
  return context.state === "active" ? context : null;
}

export function isStaffPath(path: string): boolean {
  return /^\/(ar|en)\/(dashboard|sales|operations|quality|finance|settings|admin)(?:\/|$)/.test(
    path,
  );
}
