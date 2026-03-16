import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

export const leadCaptureSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.email().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    interestArea: z.string().trim().min(2).max(120),
    source: z.string().trim().min(2).max(200),
    message: z.string().trim().max(1000).optional(),
    isHot: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone is required",
      });
    }

    if (value.phone && !phoneRegex.test(value.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number format",
        path: ["phone"],
      });
    }
  });

