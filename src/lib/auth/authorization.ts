import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { IdentityPermission } from "@/types/auth";

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";

  constructor() {
    super("The authenticated identity is not authorized for this operation.");
    this.name = "AuthorizationError";
  }
}

export async function hasIdentityPermission(permission: IdentityPermission): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return false;
  }

  const { data, error } = await supabase.rpc("has_permission", {
    requested_permission: permission,
  });

  return !error && data === true;
}

export async function requireIdentityPermission(permission: IdentityPermission): Promise<void> {
  if (!(await hasIdentityPermission(permission))) {
    throw new AuthorizationError();
  }
}
