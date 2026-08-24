import { z } from "zod";

import {
  PUBLIC_REQUEST_ALLOWED_MIME_TYPES,
  PUBLIC_REQUEST_MAX_FILE_BYTES,
  PUBLIC_REQUEST_MAX_FILES,
  PUBLIC_REQUEST_MAX_TOTAL_FILE_BYTES,
} from "@/config/public-request";

const uuidSchema = z.string().uuid();

export function normalizeSaudiMobile(value: string): string {
  const compact = value.replace(/[\s()-]/g, "");

  if (/^05\d{8}$/.test(compact)) {
    return `+966${compact.slice(1)}`;
  }

  if (/^5\d{8}$/.test(compact)) {
    return `+966${compact}`;
  }

  if (/^009665\d{8}$/.test(compact)) {
    return `+${compact.slice(2)}`;
  }

  return compact;
}

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().toLowerCase().email().max(254).nullable(),
);

const optionalTextSchema = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().min(2).max(maximum).nullable(),
  );

export const requestAddressSchema = z
  .object({
    cityId: uuidSchema,
    formattedAddress: z.string().trim().min(8).max(500),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .refine(
    (address) =>
      (address.latitude === null && address.longitude === null) ||
      (address.latitude !== null && address.longitude !== null),
    { message: "coordinates_must_be_paired" },
  );

export const publicRequestPayloadSchema = z
  .object({
    cargoDescription: z.string().trim().min(5).max(2000),
    consentAccepted: z.literal(true),
    contact: z.object({
      email: optionalEmailSchema,
      fullName: z.string().trim().min(2).max(150),
      mobile: z
        .string()
        .transform(normalizeSaudiMobile)
        .refine((value) => /^\+9665\d{8}$/.test(value)),
      notes: optionalTextSchema(3000),
    }),
    delivery: requestAddressSchema,
    honeypot: z.literal(""),
    locale: z.enum(["ar", "en"]),
    pickup: requestAddressSchema,
    quantity: z.number().int().min(1).max(100000).nullable(),
    selectedOptionIds: z
      .array(uuidSchema)
      .max(10)
      .refine((ids) => new Set(ids).size === ids.length),
    serviceId: uuidSchema,
    startedAt: z.number().int().positive(),
    submissionId: uuidSchema,
  })
  .refine(
    (payload) =>
      payload.pickup.cityId !== payload.delivery.cityId ||
      payload.pickup.formattedAddress.toLocaleLowerCase() !==
        payload.delivery.formattedAddress.toLocaleLowerCase(),
    { message: "pickup_and_delivery_must_differ", path: ["delivery", "formattedAddress"] },
  );

export const publicUploadDescriptorSchema = z.object({
  id: uuidSchema,
  mimeType: z.enum(PUBLIC_REQUEST_ALLOWED_MIME_TYPES),
  name: z.string().trim().min(1).max(255),
  size: z.number().int().min(1).max(PUBLIC_REQUEST_MAX_FILE_BYTES),
});

export const publicUploadDescriptorsSchema = z
  .array(publicUploadDescriptorSchema)
  .max(PUBLIC_REQUEST_MAX_FILES)
  .refine(
    (files) =>
      files.reduce((total, file) => total + file.size, 0) <= PUBLIC_REQUEST_MAX_TOTAL_FILE_BYTES,
    { message: "total_file_size_exceeded" },
  );

export const completedUploadSchema = publicUploadDescriptorSchema.extend({
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
  path: z.string().trim().min(20).max(1024),
});

export const completedUploadsSchema = z.array(completedUploadSchema).max(PUBLIC_REQUEST_MAX_FILES);

export const publicRequestDraftStorageSchema = z.object({
  cargoDescription: z.string().max(2000),
  consentAccepted: z.boolean(),
  contact: z.object({
    email: z.string().max(254),
    fullName: z.string().max(150),
    mobile: z.string().max(30),
    notes: z.string().max(3000),
  }),
  delivery: z.object({
    cityId: z.string().max(64),
    formattedAddress: z.string().max(500),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  }),
  honeypot: z.string().max(0),
  locale: z.enum(["ar", "en"]),
  pickup: z.object({
    cityId: z.string().max(64),
    formattedAddress: z.string().max(500),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  }),
  quantity: z.string().max(6),
  selectedOptionIds: z.array(z.string().uuid()).max(10),
  serviceId: z.string().max(64),
  startedAt: z.number().int().positive(),
  submissionId: z.string().uuid(),
});

export function isHumanSubmission(startedAt: number, now = Date.now()): boolean {
  const elapsed = now - startedAt;

  return elapsed >= 1500 && elapsed <= 7 * 24 * 60 * 60 * 1000;
}
