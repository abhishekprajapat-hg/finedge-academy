"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const goalOptions = ["Retirement", "Wealth Creation", "Child Education", "Home Purchase", "Tax Planning"];

type RiskResult = {
  category: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
  weightedScore: number;
  allocation: Record<string, number>;
};

export function FinancialProfilingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [values, setValues] = useState({
    age: "30",
    annualIncome: "1200000",
    savings: "300000",
    investmentHorizon: "10",
    riskTolerance: "5",
    goals: ["Wealth Creation"],
  });

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(values.age && values.annualIncome && values.savings);
    }
    if (step === 2) {
      return Boolean(values.investmentHorizon && values.riskTolerance && values.goals.length);
    }
    return true;
  }, [step, values]);

  const toggleGoal = (goal: string) => {
    setValues((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((item) => item !== goal) : [...prev.goals, goal],
    }));
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profiling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: Number(values.age),
          annualIncome: Number(values.annualIncome),
          savings: Number(values.savings),
          investmentHorizon: Number(values.investmentHorizon),
          riskTolerance: Number(values.riskTolerance),
          goals: values.goals,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; result?: RiskResult };

      if (!response.ok || !data.ok || !data.result) {
        setError(data.error ?? "Unable to process profiling");
        return;
      }

      setResult(data.result);
      setStep(3);
    } catch {
      setError("Unable to process profiling");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Profiling Engine</CardTitle>
        <p className="text-sm text-[#4d6480]">Step {step} of 3</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitProfile} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={18} max={100} value={values.age} onChange={(event) => setValues((prev) => ({ ...prev, age: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Annual Income (INR)</Label>
                <Input id="income" type="number" min={0} value={values.annualIncome} onChange={(event) => setValues((prev) => ({ ...prev, annualIncome: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings">Current Savings (INR)</Label>
                <Input id="savings" type="number" min={0} value={values.savings} onChange={(event) => setValues((prev) => ({ ...prev, savings: event.target.value }))} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="horizon">Investment Horizon (Years)</Label>
                <Input
                  id="horizon"
                  type="number"
                  min={1}
                  max={50}
                  value={values.investmentHorizon}
                  onChange={(event) => setValues((prev) => ({ ...prev, investmentHorizon: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk">Risk Tolerance (1-10)</Label>
                <Select id="risk" value={values.riskTolerance} onChange={(event) => setValues((prev) => ({ ...prev, riskTolerance: event.target.value }))}>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goals</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {goalOptions.map((goal) => (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      values.goals.includes(goal)
                        ? "border-[#0d7a84] bg-[#e3f6f5] text-[#0b5c66]"
                        : "border-[#b8d0e5] bg-white text-[#36506d] hover:border-[#8eb8d9]"
                    }`}
                  >
                    {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 && result ? (
            <div className="space-y-4 rounded-xl border border-[#b7d9d9] bg-[#e8f8f7] p-4">
              <p className="text-sm font-semibold text-[#38556f]">Risk Score: {result.weightedScore}</p>
              <h3 className="text-xl font-bold text-[#0b5c66]">{result.category} Investor</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(result.allocation).map(([asset, percent]) => (
                  <div key={asset} className="rounded-md border border-[#c5deef] bg-white px-3 py-2 text-sm text-[#335171]">
                    {asset.toUpperCase()}: {percent}%
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/courses">Explore Recommended Courses</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Book Consultation</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1 || loading}>
              Back
            </Button>
            {step < 2 ? (
              <Button type="button" onClick={() => setStep((prev) => prev + 1)} disabled={!canContinue}>
                Continue
              </Button>
            ) : step === 2 ? (
              <Button type="submit" disabled={!canContinue || loading}>
                {loading ? "Calculating..." : "Calculate Profile"}
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep(1)}>
                Start Over
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

