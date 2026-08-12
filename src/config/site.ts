import { ACTIVE_PRODUCTION_ORIGIN, BRAND } from "@/config/brand";

export function getMetadataBase(): URL {
  return new URL(ACTIVE_PRODUCTION_ORIGIN);
}

export function getWhatsAppHref(message: string): string {
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const recipient = /^9665\d{8}$/.test(configuredNumber) ? configuredNumber : "";
  const url = new URL(recipient ? `https://wa.me/${recipient}` : "https://wa.me/");

  url.searchParams.set("text", message);

  return url.toString();
}

export { BRAND };
