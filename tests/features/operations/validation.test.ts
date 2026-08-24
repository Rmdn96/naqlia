import { describe, expect, it } from "vitest";
import {
  trackingRecoverySchema,
  trackingTokenSchema,
  tripScheduleSchema,
} from "@/features/operations/lib/validation";

describe("Operations boundary validation", () => {
  it("accepts only non-enumerable 256-bit hexadecimal capabilities", () => {
    expect(trackingTokenSchema.safeParse("a".repeat(64)).success).toBe(true);
    expect(trackingTokenSchema.safeParse("000001").success).toBe(false);
    expect(trackingTokenSchema.safeParse(crypto.randomUUID()).success).toBe(false);
  });

  it("validates NQ recovery references without treating them as authorization", () => {
    expect(
      trackingRecoverySchema.safeParse({ mobile: "0547349947", reference: "NQ-202608-000001" })
        .success,
    ).toBe(true);
    expect(
      trackingRecoverySchema.safeParse({ mobile: "0547349947", reference: "LD-20260813-X" })
        .success,
    ).toBe(false);
  });

  it("rejects impossible pickup and delivery windows", () => {
    const base = { driverId: null, vehicleId: null, workersCount: 2, overrideConflict: false };
    expect(
      tripScheduleSchema.safeParse({
        ...base,
        pickupWindowStart: "2026-08-13T08:00:00.000Z",
        pickupWindowEnd: "2026-08-13T09:00:00.000Z",
        deliveryWindowStart: "2026-08-13T10:00:00.000Z",
        deliveryWindowEnd: "2026-08-13T11:00:00.000Z",
      }).success,
    ).toBe(true);
    expect(
      tripScheduleSchema.safeParse({
        ...base,
        pickupWindowStart: "2026-08-13T09:00:00.000Z",
        pickupWindowEnd: "2026-08-13T08:00:00.000Z",
        deliveryWindowStart: "2026-08-13T10:00:00.000Z",
        deliveryWindowEnd: "2026-08-13T11:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
