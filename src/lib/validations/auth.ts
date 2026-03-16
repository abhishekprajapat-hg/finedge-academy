import { z } from "zod";

export const otpRequestSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const otpVerifySchema = z.object({
  email: z.email().trim().toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/),
  fullName: z.string().trim().min(2).max(80).optional(),
});

export const adminLoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export function normalizeEmailIdentifier(email: string) {
  return z.email().parse(email.trim().toLowerCase());
}
