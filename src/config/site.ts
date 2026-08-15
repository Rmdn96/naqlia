import { ACTIVE_PRODUCTION_ORIGIN, BRAND } from "@/config/brand";

export function getMetadataBase(): URL {
  return new URL(ACTIVE_PRODUCTION_ORIGIN);
}

export function getWhatsAppNumber(configuredValue?: string | null): string {
  const runtimeValue = configuredValue ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const configuredNumber = runtimeValue?.replace(/\D/g, "") ?? "";

  return /^9665\d{8}$/.test(configuredNumber) ? configuredNumber : BRAND.support.whatsapp;
}

export function getWhatsAppHref(message: string, configuredValue?: string | null): string {
  const recipient = getWhatsAppNumber(configuredValue);
  const url = new URL(`https://wa.me/${recipient}`);

  url.searchParams.set("text", message);

  return url.toString();
}

export function getGoogleReviewUrl(configuredValue?: string | null): string | null {
  const value = configuredValue?.trim() || process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export { BRAND };
