import { z } from "zod";

export const lessonProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().default(true),
});

