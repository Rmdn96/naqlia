"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { respondToCustomerQuotation } from "@/features/customer-quotation/services/customer-quotation.service";
import type { CustomerQuotationActionResult } from "@/features/customer-quotation/types/customer-quotation";
import type { AppLocale } from "@/i18n/routing";

export async function respondToQuotationAction(input: {
  locale: AppLocale;
  reasonCode: "changed_requirements" | "no_longer_needed" | "other" | "price" | "timing" | null;
  reasonText: string | null;
  response: "accept" | "reject";
  token: string;
}): Promise<CustomerQuotationActionResult> {
  try {
    const result = await respondToCustomerQuotation(input);
    revalidatePath(`/${input.locale}/quote/${input.token}`);
    return { result, status: "success" };
  } catch (error) {
    return {
      message: error instanceof ZodError ? "invalid_reason" : "response_failed",
      status: "error",
    };
  }
}
