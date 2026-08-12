import type { SupabasePublicEnvironment } from "@/types/supabase";

function getRequiredValue(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function getHttpUrl(name: string, value: string | undefined): string {
  const requiredValue = getRequiredValue(name, value);

  try {
    const url = new URL(requiredValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported URL protocol");
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Environment variable ${name} must be a valid HTTP(S) URL`);
  }
}

export function getApplicationUrl(): string {
  return getHttpUrl("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
}

export function getSupabasePublicEnvironment(): SupabasePublicEnvironment {
  return {
    publishableKey: getRequiredValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    url: getHttpUrl("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  };
}

export function getDefaultQuotationVatRate(): number {
  const value = process.env.NAQLK_DEFAULT_QUOTATION_VAT_RATE ?? "0.15";
  const vatRate = Number(value);

  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 1) {
    throw new Error("NAQLK_DEFAULT_QUOTATION_VAT_RATE must be a decimal between 0 and 1");
  }

  return vatRate;
}

export function getDefaultQuotationValidityDays(): number {
  const value = process.env.NAQLK_DEFAULT_QUOTATION_VALIDITY_DAYS ?? "7";
  const validityDays = Number(value);

  if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365) {
    throw new Error("NAQLK_DEFAULT_QUOTATION_VALIDITY_DAYS must be an integer between 1 and 365");
  }

  return validityDays;
}
