"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  cancelInvitation,
  markInvitationResent,
  registerInvitation,
  setStaffAccess,
  setStaffRole,
  updateBusinessSetting,
  updateServiceArea,
} from "@/features/staff-portal/services/administration.service";
import type { AppLocale } from "@/i18n/routing";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import { resolveAuthRedirectOriginFromHeaders } from "@/lib/auth/redirect-origin.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const roles = z.enum(["super_admin", "sales", "operations", "finance", "customer_service"]);
const reason = z.string().trim().min(8).max(500);

export async function updateBusinessSettingAction(locale: AppLocale, formData: FormData) {
  const key = z
    .string()
    .regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/)
    .safeParse(formData.get("key"));
  const value = z
    .string()
    .max(2000)
    .safeParse(formData.get("value") ?? "");
  if (!key.success || !value.success)
    redirect(`/${locale}/settings/business?result=invalid` as never);
  await updateBusinessSetting(key.data, value.data);
  revalidatePath("/", "layout");
  redirect(`/${locale}/settings/business?result=updated` as never);
}

export async function updateServiceAreaAction(locale: AppLocale, formData: FormData) {
  const parsed = z
    .object({
      city: z.string().uuid(),
      status: z.enum(["active", "inactive"]),
      order: z.coerce.number().int().min(0).max(10000),
    })
    .safeParse({
      city: formData.get("city"),
      status: formData.get("status"),
      order: formData.get("order"),
    });
  if (!parsed.success) redirect(`/${locale}/settings/business?result=invalid` as never);
  await updateServiceArea(parsed.data.city, parsed.data.status, parsed.data.order);
  revalidatePath("/", "layout");
  redirect(`/${locale}/settings/business?result=updated` as never);
}

async function requireUserAdministrator() {
  const context = await getPortalContext();
  if (!context?.permissions.includes("administration.users.manage")) throw new Error("FORBIDDEN");
  return context;
}

export async function inviteStaffAction(locale: AppLocale, formData: FormData) {
  await requireUserAdministrator();
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email().max(254),
      name: z.string().trim().min(2).max(120),
      role: roles,
    })
    .safeParse({
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
    });
  if (!parsed.success) redirect(`/${locale}/admin/users?result=invalid` as never);
  const requestHeaders = await headers();
  const origin = resolveAuthRedirectOriginFromHeaders(requestHeaders);
  const redirectTo = new URL(`/${locale}/staff/accept-invite`, origin).toString();
  const admin = createAdminSupabaseClient();
  const { data: users, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) redirect(`/${locale}/admin/users?result=invite_failed` as never);
  const existing = users.users.find((user) => user.email?.toLowerCase() === parsed.data.email);
  let authUserId = existing?.id;

  if (existing) {
    const { error } = await admin.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    if (error) redirect(`/${locale}/admin/users?result=invite_failed` as never);
  } else {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { display_name: parsed.data.name, preferred_locale: locale },
      redirectTo,
    });
    if (error || !data.user) redirect(`/${locale}/admin/users?result=invite_failed` as never);
    authUserId = data.user.id;
  }

  if (!authUserId) redirect(`/${locale}/admin/users?result=invite_failed` as never);
  await registerInvitation(authUserId, parsed.data.email, parsed.data.name, parsed.data.role);
  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?result=invited` as never);
}

export async function resendInvitationAction(locale: AppLocale, formData: FormData) {
  await requireUserAdministrator();
  const id = z.string().uuid().parse(formData.get("invitation"));
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("staff_invitations")
    .select("email")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();
  if (!data) redirect(`/${locale}/admin/users?result=invalid` as never);
  const requestHeaders = await headers();
  const origin = resolveAuthRedirectOriginFromHeaders(requestHeaders);
  const { error } = await admin.auth.signInWithOtp({
    email: data.email,
    options: {
      emailRedirectTo: new URL(`/${locale}/staff/accept-invite`, origin).toString(),
      shouldCreateUser: false,
    },
  });
  if (error) redirect(`/${locale}/admin/users?result=invite_failed` as never);
  await markInvitationResent(id);
  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?result=resent` as never);
}

export async function cancelInvitationAction(locale: AppLocale, formData: FormData) {
  await requireUserAdministrator();
  const parsed = z
    .object({ id: z.string().uuid(), reason })
    .parse({ id: formData.get("invitation"), reason: formData.get("reason") });
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("staff_invitations")
    .select("auth_user_id")
    .eq("id", parsed.id)
    .eq("status", "pending")
    .maybeSingle();
  await cancelInvitation(parsed.id, parsed.reason);
  if (data) await admin.auth.admin.updateUserById(data.auth_user_id, { ban_duration: "876000h" });
  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?result=cancelled` as never);
}

export async function changeStaffRoleAction(locale: AppLocale, formData: FormData) {
  const parsed = z.object({ profile: z.string().uuid(), role: roles, reason }).parse({
    profile: formData.get("profile"),
    role: formData.get("role"),
    reason: formData.get("reason"),
  });
  await setStaffRole(parsed.profile, parsed.role, parsed.reason);
  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?result=role_updated` as never);
}
export async function setStaffAccessAction(locale: AppLocale, formData: FormData) {
  const parsed = z
    .object({ profile: z.string().uuid(), active: z.enum(["true", "false"]), reason })
    .parse({
      profile: formData.get("profile"),
      active: formData.get("active"),
      reason: formData.get("reason"),
    });
  await setStaffAccess(parsed.profile, parsed.active === "true", parsed.reason);
  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?result=status_updated` as never);
}
