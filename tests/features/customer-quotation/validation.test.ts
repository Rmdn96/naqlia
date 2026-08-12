import { describe, expect, it } from "vitest";

import {
  customerQuotationResponseSchema,
  customerQuotationTokenSchema,
} from "@/features/customer-quotation/lib/validation";

const token = "a".repeat(64);

describe("customer quotation capability validation", () => {
  it("accepts only a 256-bit hexadecimal token representation", () => {
    expect(customerQuotationTokenSchema.safeParse(token).success).toBe(true);
    expect(customerQuotationTokenSchema.safeParse("a".repeat(63)).success).toBe(false);
    expect(customerQuotationTokenSchema.safeParse("A".repeat(64)).success).toBe(false);
    expect(customerQuotationTokenSchema.safeParse("../quotation").success).toBe(false);
  });

  it("allows rejection without a reason and with a bounded optional reason", () => {
    expect(
      customerQuotationResponseSchema.safeParse({
        reasonCode: null,
        reasonText: null,
        response: "reject",
        token,
      }).success,
    ).toBe(true);
    expect(
      customerQuotationResponseSchema.safeParse({
        reasonCode: "price",
        reasonText: "The total is outside the current budget.",
        response: "reject",
        token,
      }).success,
    ).toBe(true);
    expect(
      customerQuotationResponseSchema.safeParse({
        reasonCode: "other",
        reasonText: "x".repeat(501),
        response: "reject",
        token,
      }).success,
    ).toBe(false);
  });
});
