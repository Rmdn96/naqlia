import { describe, expect, it } from "vitest";

import {
  accountProfileSchema,
  parseCapabilityUrl,
} from "@/features/customer-account/lib/validation";

const token = "a".repeat(64);

describe("Customer Account capability validation", () => {
  it.each([
    [`https://naqlk.vercel.app/ar/quote/${token}`, "quotation"],
    [`https://naqlk.vercel.app/en/track/${token}`, "tracking"],
    [`http://localhost:3000/ar/track/${token}`, "tracking"],
  ])("accepts a supported secure capability URL", (url, type) => {
    expect(parseCapabilityUrl(url)).toEqual({ token, type });
  });

  it.each([
    "NQ-202608-000001",
    "https://naqlk.vercel.app/ar/quote/not-a-token",
    `https://attacker.example/ar/account/${token}`,
    `http://naqlk.vercel.app/ar/track/${token}`,
    `https://naqlk.vercel.app/ar/track/${token}/extra`,
  ])("rejects non-capability claiming input: %s", (value) => {
    expect(parseCapabilityUrl(value)).toBeNull();
  });

  it("validates a localized customer profile without accepting staff fields", () => {
    expect(
      accountProfileSchema.parse({ displayName: "محمد", locale: "ar", mobile: "0547349947" }),
    ).toEqual({ displayName: "محمد", locale: "ar", mobile: "0547349947" });
    expect(
      accountProfileSchema.parse({
        displayName: "Customer",
        locale: "en",
        mobile: "",
        role: "super_admin",
      }),
    ).not.toHaveProperty("role");
    expect(
      accountProfileSchema.safeParse({
        displayName: "A",
        locale: "ar",
        mobile: "",
        role: "super_admin",
      }).success,
    ).toBe(false);
  });
});
