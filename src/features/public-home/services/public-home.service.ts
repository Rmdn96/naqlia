import "server-only";

import type { AppLocale } from "@/i18n/routing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicHomeContent = {
  cities: Array<{ name: string; region: string }>;
  reviews: Array<{ city: string; comment: string; displayName: string; rating: number }>;
};

type Payload = {
  cities?: Array<{ name?: unknown; region?: unknown }>;
  reviews?: Array<{ city?: unknown; comment?: unknown; display_name?: unknown; rating?: unknown }>;
};

export async function getPublicHomeContent(locale: AppLocale): Promise<PublicHomeContent> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_public_homepage_content", { p_locale: locale });
    if (error || !data || typeof data !== "object" || Array.isArray(data))
      return { cities: [], reviews: [] };
    const payload = data as Payload;
    return {
      cities: (payload.cities ?? []).flatMap((item) =>
        typeof item.name === "string" && typeof item.region === "string"
          ? [{ name: item.name, region: item.region }]
          : [],
      ),
      reviews: (payload.reviews ?? []).flatMap((item) =>
        typeof item.city === "string" &&
        typeof item.comment === "string" &&
        typeof item.display_name === "string" &&
        typeof item.rating === "number" &&
        item.rating >= 1 &&
        item.rating <= 5
          ? [
              {
                city: item.city,
                comment: item.comment,
                displayName: item.display_name,
                rating: item.rating,
              },
            ]
          : [],
      ),
    };
  } catch {
    return { cities: [], reviews: [] };
  }
}
