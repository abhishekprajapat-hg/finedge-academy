import { Metadata } from "next";
import { Compass, Handshake, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
};

const pillars = [
  {
    title: "Educate",
    body: "Practical courses and blogs built around Indian market realities and everyday financial decisions.",
    icon: Compass,
  },
  {
    title: "Profile",
    body: "Risk-oriented profiling to align decisions with age, goals, income stability, and investment horizon.",
    icon: ShieldCheck,
  },
  {
    title: "Execute",
    body: "Conversion workflows and partner bridges to move from planning into action with confidence.",
    icon: Handshake,
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="site-container space-y-10 py-12">
        <section className="hero-gradient hero-about p-7 sm:p-8">
          <div className="relative z-10 max-w-4xl space-y-4">
            <p className="kicker border-white/35 bg-white/10 text-[#d4ecff]">About FinEdge</p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">We turn financial education into practical action plans.</h1>
            <p className="text-sm leading-7 text-[#d3e7f3] sm:text-base">
              FinEdge Academy is designed for users who want clarity, better risk decisions, and implementation support instead of fragmented advice.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((item) => (
            <Card key={item.title}>
              <CardHeader className="space-y-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2f5f4] text-[#006d77]">
                  <item.icon className="h-5 w-5" />
                </span>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[#4d6480]">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}
