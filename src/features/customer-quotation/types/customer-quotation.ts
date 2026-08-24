export type CustomerQuotationState =
  "accepted" | "active" | "expired" | "invalid" | "rejected" | "superseded";

export type CustomerQuotationPayload = {
  lead: {
    customer_name: string;
    delivery: { city_name_ar: string; city_name_en: string; formatted_address: string };
    pickup: { city_name_ar: string; city_name_en: string; formatted_address: string };
    preferred_locale: "ar" | "en";
    reference_number: string;
    service: { name_ar: string; name_en: string };
  };
  order_number: string | null;
  quotation: {
    accepted_at: string | null;
    created_at: string;
    currency: string;
    customer_notes: string | null;
    expires_at: string;
    line_items: Array<{
      description: string;
      line_number: number;
      line_total_amount: number;
      quantity: number;
      unit_price: number;
    }>;
    quotation_number: string;
    quoted_amount: number;
    rejected_at: string | null;
    revision_number: number;
    sent_at: string;
    status: string;
    subtotal_amount: number;
    tax_amount: number;
    terms_ar: string;
    terms_en: string;
    vat_rate: number;
  };
  state: Exclude<CustomerQuotationState, "invalid">;
};

export type CustomerQuotationLookup = CustomerQuotationPayload | { state: "invalid" };

export type CustomerQuotationResponseResult =
  | { orderNumber: string | null; respondedAt: string | null; state: "accepted" | "rejected" }
  | { state: "expired" | "invalid" | "superseded" };

export type CustomerQuotationActionResult =
  | { result: CustomerQuotationResponseResult; status: "success" }
  | { message: "invalid_reason" | "response_failed"; status: "error" };
