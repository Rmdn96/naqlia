import { describe, expect, it } from "vitest";

import { IDENTITY_PERMISSIONS, STAFF_ROLES } from "@/config/identity";

describe("identity configuration", () => {
  it("defines the five approved internal roles", () => {
    expect(STAFF_ROLES).toEqual([
      "super_admin",
      "sales",
      "operations",
      "finance",
      "customer_service",
    ]);
    expect(new Set(STAFF_ROLES).size).toBe(STAFF_ROLES.length);
  });

  it("contains identity permissions only", () => {
    expect(IDENTITY_PERMISSIONS).toHaveLength(5);
    expect(IDENTITY_PERMISSIONS.every((permission) => permission.startsWith("identity."))).toBe(
      true,
    );
    expect(IDENTITY_PERMISSIONS.every((permission) => permission.split(".").length === 3)).toBe(
      true,
    );
  });
});
