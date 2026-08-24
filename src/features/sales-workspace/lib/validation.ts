import { z } from "zod";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || "");

export const quotationLineItemSchema = z.object({
  description: z.string().trim().min(2).max(500),
  quantity: z.number().positive().max(100_000),
  unitPrice: z.number().min(0).max(9_999_999_999.99),
});

export const quotationDraftSchema = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/),
  customerNotes: optionalText(3000),
  expiresAt: z.string().datetime({ offset: true }),
  internalNotes: optionalText(5000),
  lineItems: z.array(quotationLineItemSchema).min(1).max(100),
  vatRate: z.number().min(0).max(1),
});

export const salesLeadIdSchema = z.string().uuid();
export const salesQuotationIdSchema = z.string().uuid();

export function toQuotationRpcPayload(draft: z.infer<typeof quotationDraftSchema>) {
  return {
    currency: draft.currency,
    customer_notes: draft.customerNotes,
    expires_at: draft.expiresAt,
    internal_notes: draft.internalNotes,
    line_items: draft.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unit_price: item.unitPrice.toFixed(2),
    })),
    vat_rate: draft.vatRate.toFixed(4),
  };
}
