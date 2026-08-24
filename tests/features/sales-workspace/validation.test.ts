import { describe, expect, it } from "vitest";

import {
  quotationDraftSchema,
  toQuotationRpcPayload,
} from "@/features/sales-workspace/lib/validation";

const validDraft = {
  currency: "sar",
  customerNotes: "Please contact the customer before delivery.",
  expiresAt: "2026-08-11T12:00:00.000Z",
  internalNotes: "Review access requirements before confirming.",
  lineItems: [
    {
      description: "Furniture moving and loading",
      quantity: 2,
      unitPrice: 1250.5,
    },
  ],
  vatRate: 0.15,
};

describe("Sales Quotation validation", () => {
  it("normalizes a valid quotation draft before it crosses the command boundary", () => {
    const parsed = quotationDraftSchema.parse(validDraft);
    const payload = toQuotationRpcPayload(parsed);

    expect(parsed.currency).toBe("SAR");
    expect(payload.vat_rate).toBe("0.1500");
    expect(payload.line_items[0]).toMatchObject({ quantity: "2", unit_price: "1250.50" });
  });

  it("requires a complete line item and a bounded VAT rate", () => {
    expect(
      quotationDraftSchema.safeParse({
        ...validDraft,
        lineItems: [{ ...validDraft.lineItems[0], description: "x" }],
      }).success,
    ).toBe(false);
    expect(quotationDraftSchema.safeParse({ ...validDraft, vatRate: 1.01 }).success).toBe(false);
  });

  it("requires an ISO timestamp with an explicit offset", () => {
    expect(
      quotationDraftSchema.safeParse({ ...validDraft, expiresAt: "2026-08-11T12:00" }).success,
    ).toBe(false);
  });
});
