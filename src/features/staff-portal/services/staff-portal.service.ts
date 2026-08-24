import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  PortalContext,
  PortalDashboard,
  PortalNotification,
  PortalSearchResult,
} from "@/features/staff-portal/types/staff-portal";

export async function getPortalContext(): Promise<PortalContext | null> {
  const supabase = await createServerSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data, error } = await supabase.rpc("portal_get_context");
  return error || !data ? null : (data as unknown as PortalContext);
}

export async function getPortalDashboard(): Promise<PortalDashboard> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("portal_get_dashboard");
  if (error || !data) throw new Error("PORTAL_DASHBOARD_UNAVAILABLE", { cause: error });
  return data as unknown as PortalDashboard;
}

export async function searchPortal(query: string): Promise<PortalSearchResult[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("portal_global_search", { p_query: query });
  return error || !Array.isArray(data) ? [] : (data as unknown as PortalSearchResult[]);
}

export async function getPortalNotifications(): Promise<PortalNotification[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("portal_list_notifications", { p_limit: 20 });
  return error || !Array.isArray(data) ? [] : (data as unknown as PortalNotification[]);
}

export async function markPortalNotificationsRead(activity?: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("portal_mark_notifications_read", {
    p_activity: activity ?? null,
  });
  if (error) throw new Error("NOTIFICATION_UPDATE_FAILED", { cause: error });
}
