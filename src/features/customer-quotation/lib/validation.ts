import { z } from "zod";

export const customerQuotationTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const customerQuotationResponseSchema = z.object({
  reasonCode: z
    .enum(["price", "timing", "changed_requirements", "no_longer_needed", "other"])
    .nullable(),
  reasonText: z.string().trim().max(500).nullable(),
  response: z.enum(["accept", "reject"]),
  token: customerQuotationTokenSchema,
});
