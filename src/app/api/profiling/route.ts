import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { calculateRiskProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { profilingSchema } from "@/lib/validations/profiling";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = profilingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid profiling payload", parsed.error.flatten());
    }

    const session = await getSessionFromRequest(request);
    const computed = calculateRiskProfile(parsed.data);

    await prisma.financialProfile.create({
      data: {
        age: parsed.data.age,
        annualIncome: parsed.data.annualIncome,
        savings: parsed.data.savings,
        investmentHorizon: parsed.data.investmentHorizon,
        riskTolerance: parsed.data.riskTolerance,
        goals: parsed.data.goals,
        weightedScore: computed.weightedScore,
        category: computed.category,
        allocation: computed.allocation,
        userId: session?.sub,
      },
    });

    return NextResponse.json({
      ok: true,
      result: computed,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to process financial profile");
  }
}

