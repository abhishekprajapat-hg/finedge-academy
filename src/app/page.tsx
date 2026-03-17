import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, ChartColumnBig, Handshake, ShieldCheck, Sparkles, Target, Users2 } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadSources } from "@/lib/constants";

const highlights = [
  {
    title: "Financial Profiling",
    description: "Understand your risk capacity with measurable scoring, then move to actionable allocation.",
    icon: ChartColumnBig,
  },
  {
    title: "Execution-Ready Learning",
    description: "Step-by-step courses built for implementation in Indian markets, not just theory.",
    icon: Target,
  },
  {
    title: "Partner-Assisted Outcomes",
    description: "Bridge into brokerage and insurance execution through vetted partner journeys.",
    icon: Handshake,
  },
];

const processFlow = [
  {
    title: "Diagnose",
    text: "Profile goals, horizon, risk appetite and current position.",
  },
  {
    title: "Design",
    text: "Get structured recommendations and practical frameworks.",
  },
  {
    title: "Deploy",
    text: "Move to execution with support for investment and protection workflows.",
  },
];

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="metric-pill">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#d2edf6]">
        <Icon className="h-4 w-4 text-[#9fdfeb]" />
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="site-container section-gap relative">
        <div className="hero-gradient hero-home page-reveal p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="space-y-6">
              <p className="kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Financial Growth Operating System
              </p>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  Rebuild your money decisions with a professional, guided framework.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#d5e8f4] sm:text-base">
                  FinEdge Academy combines structured education, risk profiling, and execution pathways so users can move from confusion to confidence.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/profile" className="flex items-center gap-2">
                    Start Financial Profiling
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Learning Paths" value="Execution Focused" icon={Users2} />
                <Stat label="Profiling Model" value="Data-Backed" icon={ShieldCheck} />
                <Stat label="Outcome Style" value="Action Ready" icon={ChartColumnBig} />
              </div>
            </div>

            <div className="page-reveal stagger-1">
              <LeadCaptureForm source={leadSources.HOME_HERO} defaultInterest="Consultation" title="Book Strategic Consultation" />
            </div>
          </div>
        </div>
      </section>

      <section className="site-container pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Card key={item.title} className={`page-reveal ${index === 0 ? "" : index === 1 ? "stagger-1" : "stagger-2"}`}>
              <CardHeader className="space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f7f8] text-[#006d77]">
                  <item.icon className="h-5 w-5" />
                </span>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="muted-text text-sm leading-6">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="site-container pb-16">
        <div className="grid gap-6 rounded-3xl border border-[#c6d8e9] bg-white/85 p-6 shadow-[0_28px_62px_-42px_rgba(9,30,66,0.55)] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Badge className="w-fit">How The Journey Works</Badge>
            <h2 className="text-3xl font-bold leading-tight text-[#0d1b2a]">A clear 3-step system from awareness to execution.</h2>
            <p className="max-w-2xl text-sm leading-7 text-[#4b6078] sm:text-base">
              We designed the user flow for busy professionals who need straightforward guidance, not content overload.
            </p>
            <div className="grid gap-3">
              {processFlow.map((item, index) => (
                <div key={item.title} className="rounded-xl border border-[#d5e3ef] bg-[#f4f9ff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#547693]">Step {index + 1}</p>
                  <p className="mt-1 text-base font-bold text-[#13314f]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#4b6078]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="finedge-journey-side rounded-2xl p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#547693]">Popular Next Steps</p>
            <div className="mt-4 grid gap-3">
              <Link href="/profile" className="rounded-xl border border-[#bfd6e8] bg-white p-4 text-sm font-semibold text-[#27425d] hover:border-[#8eb8d9] hover:text-[#006d77]">
                Run Financial Profiling
              </Link>
              <Link href="/courses" className="rounded-xl border border-[#bfd6e8] bg-white p-4 text-sm font-semibold text-[#27425d] hover:border-[#8eb8d9] hover:text-[#006d77]">
                Start a Learning Program
              </Link>
              <Link href="/contact" className="rounded-xl border border-[#bfd6e8] bg-white p-4 text-sm font-semibold text-[#27425d] hover:border-[#8eb8d9] hover:text-[#006d77]">
                Talk to FinEdge Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container pb-16">
        <Disclaimer />
      </section>
    </div>
  );
}
