import { z } from "zod";

const optionalRating = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
  z.number().int().min(1).max(5).nullable(),
);

export const customerReviewSchema = z.object({
  comment: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
    z.string().max(2000).nullable(),
  ),
  handlingRating: optionalRating,
  overallRating: z.coerce.number().int().min(1).max(5),
  publicationConsent: z.boolean(),
  punctualityRating: optionalRating,
});

export const reviewUuidSchema = z.string().uuid();
export const qualityPublicationActionSchema = z.enum([
  "feature",
  "publish",
  "unfeature",
  "unpublish",
]);
export const qualityAlertStatusSchema = z.enum(["in_progress", "open", "resolved"]);
