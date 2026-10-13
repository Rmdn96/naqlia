export type ContactNumber = {
  id: string;
  phone: string;
};

export const CONTACT_NUMBERS: ContactNumber[] = [
  { id: "contact-1", phone: "0547349947" },
  { id: "contact-2", phone: "0565845386" },
];

export function normalizeSaudiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("05") && digits.length === 10) return `966${digits.slice(1)}`;
  return digits;
}

export function getContactWhatsAppHref(phone: string, message: string): string | null {
  const normalized = normalizeSaudiPhone(phone);
  if (!normalized) return null;
  const url = new URL(`https://wa.me/${normalized}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export function getContactTelephoneHref(phone: string): string | null {
  const normalized = normalizeSaudiPhone(phone);
  return normalized ? `tel:+${normalized}` : null;
}
