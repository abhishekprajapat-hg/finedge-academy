import { z } from "zod";

const emailSchema = z.email().trim().toLowerCase();
const passwordSchema = z.string().trim().min(8).max(128);
const otpCodeSchema = z.string().trim().regex(/^\d{6}$/);

function withPasswordConfirmation<T extends { password: string; confirmPassword: string }>(schema: z.ZodType<T>) {
  return schema.superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
}

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerRequestSchema = withPasswordConfirmation(
  z.object({
    fullName: z.string().trim().min(2).max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  }),
);

export const registerOtpVerifySchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordVerifySchema = withPasswordConfirmation(
  z.object({
    email: emailSchema,
    code: otpCodeSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  }),
);

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export function normalizeEmailIdentifier(email: string) {
  return emailSchema.parse(email);
}
