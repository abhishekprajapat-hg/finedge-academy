import { Disclaimer } from "@/components/layout/disclaimer";
import { InsuranceCalculator } from "@/components/forms/insurance-calculator";
import { Badge } from "@/components/ui/badge";

export default function InsurancePage() {
  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-insurance p-7 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-4">
            <Badge className="hero-badge">Insurance Planning</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Protect income, liabilities, and long-term goals.</h1>
            <p className="text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Estimate your protection gap with a quick calculator and send a high-priority request for the right term cover plan.
            </p>
          </div>
        </section>

        <InsuranceCalculator />
        <Disclaimer />
      </div>
    </div>
  );
}

