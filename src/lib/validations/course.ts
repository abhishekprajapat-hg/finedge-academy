import { z } from "zod";

export const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(500).optional(),
  lessonOrder: z.coerce.number().int().min(1).max(500),
  videoUrl: z.url(),
  isPreview: z.boolean().optional().default(false),
});

export const courseSchema = z.object({
  title: z.string().trim().min(4).max(180),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(20).max(2000),
  pricePaise: z.coerce.number().int().min(100),
  thumbnailUrl: z.url().optional().or(z.literal("")),
  isPublished: z.boolean().optional().default(false),
  lessons: z.array(lessonSchema).min(1),
});

