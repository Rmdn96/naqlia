import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "@/lib/auth/redirects";

describe("getSafeRedirectPath", () => {
  it("allows a local application path", () => {
    expect(getSafeRedirectPath("/ar/account?tab=orders")).toBe("/ar/account?tab=orders");
  });

  it.each([undefined, null, "", "https://attacker.example", "//attacker.example", "/%5Cevil"])(
    "falls back for unsafe input: %s",
    (value) => {
      expect(getSafeRedirectPath(value)).toBe("/");
    },
  );
});
