import type { AppLocale } from "@/i18n/routing";

export const SIGN_OUT_INTENT_HEADER = "x-naqlk-logout";
export const SIGN_OUT_INTENT_VALUE = "same-origin";

export function resolveSignOutLocale(value: FormDataEntryValue | null): AppLocale {
  return value === "en" ? "en" : "ar";
}
