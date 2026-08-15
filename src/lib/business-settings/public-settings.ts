import "server-only";

import { cache } from "react";

import { getDefaultQuotationValidityDays } from "@/config/env";
import { getGoogleReviewUrl, getWhatsAppNumber } from "@/config/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicBusinessConfiguration = {
  googleReviewUrl: string | null;
  quotationValidityDays: number;
  whatsappNumber: string;
};

type PublicSettingsPayload = {
  contact_whatsapp?: string | null;
  customer_google_review_url?: string | null;
  quotation_default_validity_days?: string | null;
};

export const getPublicBusinessConfiguration = cache(
  async (): Promise<PublicBusinessConfiguration> => {
    let values: PublicSettingsPayload = {};

    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.rpc("get_public_business_settings");

      if (!error && data && typeof data === "object" && !Array.isArray(data)) {
        values = data as PublicSettingsPayload;
      }
    } catch {
      // The environment fallback keeps public flows available during migration or an outage.
    }

    const parsedValidity = Number(values.quotation_default_validity_days);

    return {
      googleReviewUrl: getGoogleReviewUrl(values.customer_google_review_url),
      quotationValidityDays:
        Number.isInteger(parsedValidity) && parsedValidity >= 1 && parsedValidity <= 365
          ? parsedValidity
          : getDefaultQuotationValidityDays(),
      whatsappNumber: getWhatsAppNumber(values.contact_whatsapp),
    };
  },
);
