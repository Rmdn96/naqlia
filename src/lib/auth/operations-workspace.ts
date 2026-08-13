import { AuthorizationError } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OperationsWorkspacePermission } from "@/types/auth";

export async function requireOperationsWorkspacePermission(
  permission: OperationsWorkspacePermission,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) throw new AuthorizationError();
  const { data, error } = await supabase.rpc("has_permission", {
    requested_permission: permission,
  });
  if (error || data !== true) throw new AuthorizationError();
}
