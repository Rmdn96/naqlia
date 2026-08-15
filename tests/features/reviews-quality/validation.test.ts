import { describe, expect, it } from "vitest";

import { customerReviewSchema } from "@/features/reviews-quality/lib/validation";

describe("customer Review validation", () => {
  it("requires a 1–5 overall rating", () => {
    const base = {
      comment: null,
      handlingRating: null,
      publicationConsent: false,
      punctualityRating: null,
    };
    expect(customerReviewSchema.safeParse({ ...base, overallRating: 1 }).success).toBe(true);
    expect(customerReviewSchema.safeParse({ ...base, overallRating: 5 }).success).toBe(true);
    expect(customerReviewSchema.safeParse({ ...base, overallRating: 0 }).success).toBe(false);
    expect(customerReviewSchema.safeParse({ ...base, overallRating: 6 }).success).toBe(false);
  });

  it("keeps criteria optional but bounded", () => {
    const base = { comment: "", overallRating: 4, publicationConsent: true };
    expect(
      customerReviewSchema.safeParse({ ...base, handlingRating: "", punctualityRating: "" })
        .success,
    ).toBe(true);
    expect(
      customerReviewSchema.safeParse({ ...base, handlingRating: 3, punctualityRating: 5 }).success,
    ).toBe(true);
    expect(
      customerReviewSchema.safeParse({ ...base, handlingRating: 8, punctualityRating: null })
        .success,
    ).toBe(false);
  });

  it("normalizes empty comments and rejects oversized text", () => {
    const base = {
      handlingRating: null,
      overallRating: 5,
      publicationConsent: false,
      punctualityRating: null,
    };
    expect(customerReviewSchema.parse({ ...base, comment: "   " }).comment).toBeNull();
    expect(customerReviewSchema.safeParse({ ...base, comment: "x".repeat(2001) }).success).toBe(
      false,
    );
  });
});
