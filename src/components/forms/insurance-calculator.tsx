"use client";

import { useMemo, useState } from "react";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import { leadSources } from "@/lib/constants";

export function InsuranceCalculator() {
  const [income, setIncome] = useState("1200000");
  const [liabilities, setLiabilities] = useState("1000000");
  const [existingCover, setExistingCover] = useState("2000000");
  const [submitted, setSubmitted] = useState(false);

  const protectionGap = useMemo(() => {
    const incomeValue = Number(income) || 0;
    const liabilitiesValue = Number(liabilities) || 0;
    const coverValue = Number(existingCover) || 0;
    const humanLifeValue = incomeValue * 15 + liabilitiesValue;
    return Math.max(0, humanLifeValue - coverValue);
  }, [income, liabilities, existingCover]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Human Life Value Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">Annual Income (INR)</Label>
            <Input id="income" type="number" value={income} onChange={(event) => setIncome(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="liabilities">Total Liabilities (INR)</Label>
            <Input id="liabilities" type="number" value={liabilities} onChange={(event) => setLiabilities(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Existing Insurance Cover (INR)</Label>
            <Input id="cover" type="number" value={existingCover} onChange={(event) => setExistingCover(event.target.value)} />
          </div>

          <div className="rounded-xl border border-[#b7d9d9] bg-[#e8f8f7] p-4">
            <p className="text-sm font-semibold text-[#38556f]">Estimated Protection Gap</p>
            <p className="text-2xl font-bold text-[#0b5c66]">{formatINR(protectionGap * 100)}</p>
            <p className="mt-1 text-sm text-[#4d6480]">If this is positive, you likely need additional term protection.</p>
          </div>

          <Button type="button" onClick={() => setSubmitted(true)}>
            Request Quote
          </Button>
        </CardContent>
      </Card>

      {submitted ? (
        <LeadCaptureForm
          source={leadSources.TERM_CALCULATOR}
          defaultInterest="Term Insurance"
          hotLead={protectionGap > 0}
          title="Request Quote"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ready for a Quote?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[#4d6480]">Calculate your gap, then request a custom quote and we&apos;ll prioritize your case.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
