import { afterEach, describe, expect, it } from "vitest";

import { getGoogleReviewUrl } from "@/config/site";

describe("Google Review configuration boundary", () => {
  const previous = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL;
  afterEach(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL;
    else process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL = previous;
  });

  it("hides the CTA when unconfigured or unsafe", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL;
    expect(getGoogleReviewUrl()).toBeNull();
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL = "javascript:alert(1)";
    expect(getGoogleReviewUrl()).toBeNull();
  });

  it("accepts one centralized HTTPS URL independent of rating", () => {
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL = "https://example.test/google-review";
    expect(getGoogleReviewUrl()).toBe("https://example.test/google-review");
  });
});
