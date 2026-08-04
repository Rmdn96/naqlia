"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { AuthorizationError } from "@/lib/auth/authorization";
import {
  saveSalesQuotation,
  sendSalesQuotation,
} from "@/features/sales-workspace/services/sales-workspace.service";
import type {
  QuotationCommandResult,
  QuotationDraftPayload,
} from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

type SaveQuotationActionInput = {
  draft: QuotationDraftPayload;
  leadId: string;
  locale: AppLocale;
  quotationId: string | null;
};

function revalidateSalesLead(locale: AppLocale, leadId: string): void {
  const leadPath = `/${locale}/sales/leads/${leadId}`;

  revalidatePath(leadPath);
  revalidatePath(`${leadPath}/quotation`);
  revalidatePath(`${leadPath}/quotations`);
  revalidatePath(`/${locale}/sales/leads`);
}

export async function saveQuotationAction(
  input: SaveQuotationActionInput,
): Promise<QuotationCommandResult> {
  try {
    const result = await saveSalesQuotation(input.leadId, input.quotationId, input.draft);
    revalidateSalesLead(input.locale, input.leadId);

    return { quotationId: result.id, status: "success" };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: "not_authorized", status: "error" };
    }
    if (error instanceof ZodError) {
      return { message: "invalid_draft", status: "error" };
    }

    return { message: "save_failed", status: "error" };
  }
}

export async function sendQuotationAction(
  leadId: string,
  quotationId: string,
  locale: AppLocale,
): Promise<QuotationCommandResult> {
  try {
    await sendSalesQuotation(quotationId);
    revalidateSalesLead(locale, leadId);

    return { quotationId, status: "success" };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { message: "not_authorized", status: "error" };
    }
    if (error instanceof ZodError) {
      return { message: "not_found", status: "error" };
    }

    return { message: "send_failed", status: "error" };
  }
}
