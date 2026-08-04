import { AuthorizationError } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SalesWorkspacePermission } from "@/types/auth";

export async function hasSalesWorkspacePermission(
  permission: SalesWorkspacePermission,
): Promise<boolean> {
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

export async function requireSalesWorkspacePermission(
  permission: SalesWorkspacePermission,
): Promise<void> {
  if (!(await hasSalesWorkspacePermission(permission))) {
    throw new AuthorizationError();
  }
}
