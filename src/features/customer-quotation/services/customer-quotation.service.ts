import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  customerQuotationResponseSchema,
  customerQuotationTokenSchema,
} from "@/features/customer-quotation/lib/validation";
import type {
  CustomerQuotationLookup,
  CustomerQuotationResponseResult,
} from "@/features/customer-quotation/types/customer-quotation";
import type { Json } from "@/types/supabase";

function isObject(value: Json | null): value is Record<string, Json> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function getCustomerQuotation(token: string): Promise<CustomerQuotationLookup> {
  const parsedToken = customerQuotationTokenSchema.safeParse(token);
  if (!parsedToken.success) return { state: "invalid" };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_get_quotation", {
    p_access_token: parsedToken.data,
  });

  if (error || !isObject(data) || typeof data.state !== "string") {
    return { state: "invalid" };
  }

  return data as unknown as CustomerQuotationLookup;
}

export async function respondToCustomerQuotation(rawInput: unknown) {
  const input = customerQuotationResponseSchema.parse(rawInput);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("customer_respond_to_quotation", {
    p_access_token: input.token,
    p_reason_code: input.response === "reject" ? input.reasonCode : null,
    p_reason_text: input.response === "reject" ? input.reasonText : null,
    p_response: input.response,
  });

  if (error || !isObject(data) || typeof data.state !== "string") {
    throw new Error("CUSTOMER_QUOTATION_RESPONSE_FAILED", { cause: error });
  }

  return {
    orderNumber: typeof data.order_number === "string" ? data.order_number : null,
    respondedAt: typeof data.responded_at === "string" ? data.responded_at : null,
    state: data.state,
  } as CustomerQuotationResponseResult;
}
