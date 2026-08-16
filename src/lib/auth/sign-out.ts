import type { AppLocale } from "@/i18n/routing";

export function resolveSignOutLocale(value: FormDataEntryValue | null): AppLocale {
  return value === "en" ? "en" : "ar";
}

export function isApprovedSignOutOrigin(origin: string | null, requestOrigin: string): boolean {
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(requestOrigin).origin;
  } catch {
    return false;
  }
}
