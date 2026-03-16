import { BlogStatus } from "@prisma/client";
import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(5).max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().trim().min(20),
  featuredImage: z.url().optional().or(z.literal("")),
  metaTitle: z.string().trim().max(180).optional(),
  metaDescription: z.string().trim().max(300).optional(),
  status: z.nativeEnum(BlogStatus),
});

