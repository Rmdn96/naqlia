import { DEFAULT_AFTER_AUTH_PATH } from "@/config/auth";

export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AFTER_AUTH_PATH;
  }

  try {
    const decodedValue = decodeURIComponent(value);

    if (decodedValue.startsWith("//") || decodedValue.startsWith("/\\")) {
      return DEFAULT_AFTER_AUTH_PATH;
    }
  } catch {
    return DEFAULT_AFTER_AUTH_PATH;
  }

  return value;
}
