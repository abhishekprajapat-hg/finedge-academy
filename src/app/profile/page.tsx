import { FinancialProfilingForm } from "@/components/forms/financial-profiling-form";
import { Disclaimer } from "@/components/layout/disclaimer";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-profile p-7 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-4">
            <Badge className="border-white/30 bg-white/10 text-white">Risk Discovery</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Financial Profiling Engine</h1>
            <p className="text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Complete this quick questionnaire to estimate your risk orientation and receive a suggested high-level asset mix.
            </p>
          </div>
        </section>

        <div className="max-w-4xl">
          <FinancialProfilingForm />
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}

