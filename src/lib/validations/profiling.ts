import { z } from "zod";

export const profilingSchema = z.object({
  age: z.coerce.number().int().min(18).max(100),
  annualIncome: z.coerce.number().min(1).max(1_000_000_000),
  savings: z.coerce.number().min(0).max(1_000_000_000),
  investmentHorizon: z.coerce.number().int().min(1).max(50),
  riskTolerance: z.coerce.number().int().min(1).max(10),
  goals: z.array(z.string().trim().min(2).max(120)).min(1).max(10),
});

