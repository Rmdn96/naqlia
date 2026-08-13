import { ACTIVE_PRODUCTION_ORIGIN, BRAND } from "@/config/brand";

export function getMetadataBase(): URL {
  return new URL(ACTIVE_PRODUCTION_ORIGIN);
}

export function getWhatsAppHref(message: string): string {
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const recipient = /^9665\d{8}$/.test(configuredNumber)
    ? configuredNumber
    : BRAND.support.whatsapp;
  const url = new URL(`https://wa.me/${recipient}`);

  url.searchParams.set("text", message);

  return url.toString();
}

export function getGoogleReviewUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export { BRAND };
