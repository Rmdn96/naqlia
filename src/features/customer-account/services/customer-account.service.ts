import "server-only";

import { resolveIdentityContext } from "@/lib/auth/identity-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CustomerAccountDashboard } from "@/features/customer-account/types/customer-account";

export async function getCustomerAccountDashboard() {
  const context = await resolveIdentityContext();
  if (!context) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("account_get_dashboard");
  if (error || !data) throw new Error("CUSTOMER_ACCOUNT_UNAVAILABLE", { cause: error });
  return { context, dashboard: data as unknown as CustomerAccountDashboard };
}

export async function updateCustomerAccount(
  displayName: string,
  mobile: string,
  locale: "ar" | "en",
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("account_update_profile", {
    p_display_name: displayName,
    p_locale: locale,
    p_mobile: mobile,
  });
  if (error) throw new Error("CUSTOMER_PROFILE_UPDATE_FAILED", { cause: error });
}

export async function claimCustomerRequest(type: string, token: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("account_claim_request", {
    p_capability_type: type,
    p_token: token,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return false;
  return (data as { state?: string }).state === "linked";
}

export async function issueAccountTrackingAccess(jobId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("account_issue_job_tracking_access", { p_job: jobId });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
  const payload = data as { state?: string; tracking_token?: string };
  return payload.state === "issued" && /^[a-f0-9]{64}$/.test(payload.tracking_token ?? "")
    ? (payload.tracking_token ?? null)
    : null;
}
