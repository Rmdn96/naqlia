import { z } from "zod";

export const operationsUuidSchema = z.string().uuid();
export const trackingTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const trackingRecoverySchema = z.object({
  mobile: z.string().trim().min(10).max(20),
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^NQ-\d{6}-\d{6}$/),
});
export const tripScheduleSchema = z
  .object({
    deliveryWindowEnd: z.string().datetime(),
    deliveryWindowStart: z.string().datetime(),
    driverId: z.string().uuid().nullable(),
    overrideConflict: z.boolean().default(false),
    pickupWindowEnd: z.string().datetime(),
    pickupWindowStart: z.string().datetime(),
    reason: z.string().trim().max(1000).optional(),
    vehicleId: z.string().uuid().nullable(),
    workersCount: z.number().int().min(0).max(100),
  })
  .refine((v) => new Date(v.pickupWindowStart) < new Date(v.pickupWindowEnd), "pickup_window")
  .refine((v) => new Date(v.pickupWindowEnd) <= new Date(v.deliveryWindowStart), "window_order")
  .refine(
    (v) => new Date(v.deliveryWindowStart) < new Date(v.deliveryWindowEnd),
    "delivery_window",
  );
