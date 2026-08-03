import { describe, expect, it } from "vitest";

import { staffEmailSchema } from "@/features/staff-auth/lib/validation";

describe("staffEmailSchema", () => {
  it("normalizes an approved staff email", () => {
    expect(staffEmailSchema.parse(" Staff.Member@Example.COM ")).toBe("staff.member@example.com");
  });

  it("rejects malformed and oversized addresses", () => {
    expect(staffEmailSchema.safeParse("not-an-email").success).toBe(false);
    expect(staffEmailSchema.safeParse(`${"a".repeat(245)}@example.com`).success).toBe(false);
  });
});
