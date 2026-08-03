import "server-only";

import type { SupabaseSecretEnvironment } from "@/types/supabase";

function getRequiredValue(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required server environment variable: ${name}`);
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

export function getSupabaseSecretEnvironment(): SupabaseSecretEnvironment {
  return {
    publishableKey: getRequiredValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    secretKey: getRequiredValue("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY),
    url: getHttpUrl("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  };
}
