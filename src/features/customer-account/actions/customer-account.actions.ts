"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  accountProfileSchema,
  parseCapabilityUrl,
} from "@/features/customer-account/lib/validation";
import {
  claimCustomerRequest,
  issueAccountTrackingAccess,
  updateCustomerAccount,
} from "@/features/customer-account/services/customer-account.service";
import type { AppLocale } from "@/i18n/routing";

export async function updateCustomerAccountAction(locale: AppLocale, formData: FormData) {
  const parsed = accountProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    locale,
    mobile: formData.get("mobile") ?? "",
  });
  if (!parsed.success) redirect(`/${locale}/account?result=invalid_profile` as never);
  await updateCustomerAccount(parsed.data.displayName, parsed.data.mobile, parsed.data.locale);
  revalidatePath(`/${locale}/account`);
  redirect(`/${locale}/account?result=profile_updated` as never);
}

export async function claimCustomerRequestAction(locale: AppLocale, formData: FormData) {
  const capability = parseCapabilityUrl(String(formData.get("secureUrl") ?? ""));
  if (!capability) redirect(`/${locale}/account?result=invalid_claim` as never);
  const linked = await claimCustomerRequest(capability.type, capability.token);
  revalidatePath(`/${locale}/account`);
  redirect(`/${locale}/account?result=${linked ? "claim_linked" : "invalid_claim"}` as never);
}

export async function openAccountTrackingAction(locale: AppLocale, formData: FormData) {
  const parsed = z.string().uuid().safeParse(formData.get("job"));
  if (!parsed.success) redirect(`/${locale}/account?result=invalid_tracking` as never);
  const token = await issueAccountTrackingAccess(parsed.data);
  if (!token) redirect(`/${locale}/account?result=invalid_tracking` as never);
  redirect(`/${locale}/track/${token}` as never);
}
