import { RiskCategory } from "@prisma/client";

export type ProfilingInput = {
  age: number;
  annualIncome: number;
  savings: number;
  investmentHorizon: number;
  riskTolerance: number;
  goals: string[];
};

export function calculateRiskProfile(input: ProfilingInput) {
  const ageScore = clamp(100 - Math.max(0, input.age - 20) * 1.2, 10, 100);
  const incomeScore = clamp((input.annualIncome / 3_000_000) * 100, 10, 100);
  const savingsScore = clamp((input.savings / Math.max(input.annualIncome, 1)) * 100, 5, 100);
  const horizonScore = clamp((input.investmentHorizon / 30) * 100, 5, 100);
  const toleranceScore = clamp((input.riskTolerance / 10) * 100, 5, 100);
  const goalsScore = clamp((input.goals.length / 5) * 100, 20, 100);

  const weightedScore =
    ageScore * 0.15 +
    incomeScore * 0.15 +
    savingsScore * 0.15 +
    horizonScore * 0.25 +
    toleranceScore * 0.25 +
    goalsScore * 0.05;

  const category =
    weightedScore < 40
      ? RiskCategory.CONSERVATIVE
      : weightedScore < 70
        ? RiskCategory.MODERATE
        : RiskCategory.AGGRESSIVE;

  const allocation =
    category === RiskCategory.CONSERVATIVE
      ? {
          equity: 20,
          debt: 65,
          gold: 10,
          cash: 5,
        }
      : category === RiskCategory.MODERATE
        ? {
            equity: 50,
            debt: 35,
            gold: 10,
            cash: 5,
          }
        : {
            equity: 75,
            debt: 15,
            gold: 5,
            cash: 5,
          };

  return {
    weightedScore: Math.round(weightedScore * 100) / 100,
    category,
    allocation,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

