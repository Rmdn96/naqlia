import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ActivityPayload,
  BusinessSettingsPayload,
  RolePermissionItem,
  UserListPayload,
} from "@/features/staff-portal/types/administration";

async function rpc<T>(
  name: keyof import("@/types/supabase").Database["public"]["Functions"],
  args?: Record<string, unknown>,
): Promise<T> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc(name as never, (args ?? {}) as never);
  if (error) throw new Error("PORTAL_ADMINISTRATION_UNAVAILABLE", { cause: error });
  return data as T;
}

export const getBusinessSettings = () =>
  rpc<BusinessSettingsPayload>("admin_list_business_settings");
export const updateBusinessSetting = (key: string, value: string) =>
  rpc("admin_update_business_setting", { p_key: key, p_value: value });
export const updateServiceArea = (city: string, status: string, displayOrder: number) =>
  rpc("admin_update_service_area", {
    p_city: city,
    p_status: status,
    p_display_order: displayOrder,
  });
export const getUsers = (search?: string, role?: string, status?: string) =>
  rpc<UserListPayload>("admin_list_users", {
    p_page: 1,
    p_size: 100,
    p_search: search || null,
    p_role: role || null,
    p_status: status || null,
  });
export const setStaffRole = (profile: string, role: string, reason: string) =>
  rpc("admin_set_staff_role", { p_profile: profile, p_role: role, p_reason: reason });
export const setStaffAccess = (profile: string, active: boolean, reason: string) =>
  rpc("admin_set_staff_access", { p_profile: profile, p_active: active, p_reason: reason });
export const registerInvitation = (user: string, email: string, name: string, role: string) =>
  rpc<string>("admin_register_staff_invitation", {
    p_auth_user: user,
    p_email: email,
    p_name: name,
    p_role: role,
  });
export const markInvitationResent = (invitation: string) =>
  rpc<boolean>("admin_mark_invitation_resent", { p_invitation: invitation });
export const cancelInvitation = (invitation: string, reason: string) =>
  rpc("admin_cancel_staff_invitation", { p_invitation: invitation, p_reason: reason });
export const getRolesPermissions = () => rpc<RolePermissionItem[]>("admin_list_roles_permissions");
export const getActivity = (search?: string, area?: string, event?: string) =>
  rpc<ActivityPayload>("admin_list_activity", {
    p_search: search || null,
    p_area: area || null,
    p_event: event || null,
    p_from: null,
    p_to: null,
    p_page: 1,
    p_size: 100,
  });
