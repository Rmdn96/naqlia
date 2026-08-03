import { describe, expect, it } from "vitest";

import {
  isHumanSubmission,
  normalizeSaudiMobile,
  publicRequestPayloadSchema,
  publicUploadDescriptorsSchema,
} from "@/features/public-request/lib/validation";

const validPayload = {
  cargoDescription: "غرفة نوم كاملة وطاولة طعام",
  consentAccepted: true,
  contact: {
    email: "CUSTOMER@EXAMPLE.COM",
    fullName: "محمد أحمد",
    mobile: "055 123 4567",
    notes: "التواصل مساءً",
  },
  delivery: {
    cityId: "b8b8d8d6-9ec4-4c15-b45c-825fa895ab21",
    formattedAddress: "حي النرجس، شارع عثمان بن عفان",
    latitude: 24.8111,
    longitude: 46.6753,
  },
  honeypot: "",
  locale: "ar",
  pickup: {
    cityId: "be0e668d-75fe-4249-8f09-dd9910f91bd0",
    formattedAddress: "حي الياسمين، طريق الملك عبدالعزيز",
    latitude: 24.8012,
    longitude: 46.6321,
  },
  quantity: 12,
  selectedOptionIds: ["75e34f89-30c0-4d66-ad3c-cd97531d074d"],
  serviceId: "018a0600-3fb9-45e7-bea4-3e7390d1e730",
  startedAt: Date.now() - 5000,
  submissionId: "9ea24a6e-a681-426c-9e4a-0251d6dab79f",
};

describe("public request validation", () => {
  it.each([
    ["0551234567", "+966551234567"],
    ["5 5123 4567", "+966551234567"],
    ["00966 55 123 4567", "+966551234567"],
    ["+966551234567", "+966551234567"],
  ])("normalizes Saudi mobile %s", (input, expected) => {
    expect(normalizeSaudiMobile(input)).toBe(expected);
  });

  it("normalizes trusted payload values", () => {
    const parsed = publicRequestPayloadSchema.parse(validPayload);

    expect(parsed.contact.mobile).toBe("+966551234567");
    expect(parsed.contact.email).toBe("customer@example.com");
  });

  it("rejects malformed locations and matching endpoints", () => {
    expect(
      publicRequestPayloadSchema.safeParse({
        ...validPayload,
        delivery: {
          ...validPayload.pickup,
          longitude: null,
        },
      }).success,
    ).toBe(false);
  });

  it("bounds upload count, type, and size", () => {
    expect(
      publicUploadDescriptorsSchema.safeParse([
        {
          id: "84572ccd-2438-4907-9451-f84d5a4163dd",
          mimeType: "image/jpeg",
          name: "cargo.jpg",
          size: 1024,
        },
      ]).success,
    ).toBe(true);

    expect(
      publicUploadDescriptorsSchema.safeParse([
        {
          id: "84572ccd-2438-4907-9451-f84d5a4163dd",
          mimeType: "image/svg+xml",
          name: "cargo.svg",
          size: 1024,
        },
      ]).success,
    ).toBe(false);
  });

  it("applies a bounded human-submission timing guard", () => {
    const now = Date.now();

    expect(isHumanSubmission(now - 5000, now)).toBe(true);
    expect(isHumanSubmission(now - 100, now)).toBe(false);
    expect(isHumanSubmission(now - 8 * 24 * 60 * 60 * 1000, now)).toBe(false);
  });
});
