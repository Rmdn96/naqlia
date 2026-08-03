import type { AppLocale } from "@/i18n/routing";

export function formatSalesDate(value: string | null, locale: AppLocale): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatSalesCurrency(amount: number, currency: string, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

export function salesPath(locale: AppLocale, path = ""): string {
  return `/${locale}/sales${path}`;
}
