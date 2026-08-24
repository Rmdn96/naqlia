import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(12)
  .max(72)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
    privacyAccepted: z.literal(true),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
  });
