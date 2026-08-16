import type { AppLocale } from "@/i18n/routing";

export function resolveSignOutLocale(value: FormDataEntryValue | null): AppLocale {
  return value === "en" ? "en" : "ar";
}
