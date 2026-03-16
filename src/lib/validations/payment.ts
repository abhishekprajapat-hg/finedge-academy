import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  courseId: z.string().cuid(),
});

