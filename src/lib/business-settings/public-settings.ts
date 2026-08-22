import "server-only";

import { cache } from "react";

import { getDefaultQuotationValidityDays } from "@/config/env";
import { getGoogleReviewUrl, getWhatsAppNumber } from "@/config/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicBusinessConfiguration = {
  address: { ar: string | null; en: string | null };
  email: string | null;
  googleReviewUrl: string | null;
  phone: string | null;
  quotationValidityDays: number;
  social: { instagram: string | null; tiktok: string | null; x: string | null };
  whatsappNumber: string;
  workingHours: { ar: string | null; en: string | null };
};

type PublicSettingsPayload = {
  contact_address_ar?: string | null;
  contact_address_en?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_working_hours_ar?: string | null;
  contact_working_hours_en?: string | null;
  customer_google_review_url?: string | null;
  quotation_default_validity_days?: string | null;
  social_instagram?: string | null;
  social_tiktok?: string | null;
  social_x?: string | null;
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
      address: {
        ar: values.contact_address_ar?.trim() || null,
        en: values.contact_address_en?.trim() || null,
      },
      email: values.contact_email?.trim() || null,
      googleReviewUrl: getGoogleReviewUrl(values.customer_google_review_url),
      phone: values.contact_phone?.trim() || null,
      quotationValidityDays:
        Number.isInteger(parsedValidity) && parsedValidity >= 1 && parsedValidity <= 365
          ? parsedValidity
          : getDefaultQuotationValidityDays(),
      social: {
        instagram: values.social_instagram?.trim() || null,
        tiktok: values.social_tiktok?.trim() || null,
        x: values.social_x?.trim() || null,
      },
      whatsappNumber: getWhatsAppNumber(values.contact_whatsapp),
      workingHours: {
        ar: values.contact_working_hours_ar?.trim() || null,
        en: values.contact_working_hours_en?.trim() || null,
      },
    };
  },
);
