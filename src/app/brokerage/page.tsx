import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { affiliatePartners, leadSources } from "@/lib/constants";

export default function BrokeragePage() {
  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-brokerage p-7 sm:p-8">
          <div className="relative z-10 space-y-4">
            <Badge className="hero-badge">Brokerage & Mutual Funds</Badge>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose the right execution partner for investments.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Compare partner pathways and continue with tracked bridge links so we can support your onboarding journey end to end.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {affiliatePartners.map((partner) => (
              <Card key={partner.key} className="h-full">
                <CardHeader className="space-y-2">
                  <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cfe1ee] bg-[#edf5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3f6384]">
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-[#006d77]" />
                    {partner.category}
                  </p>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-[#4d6480]">{partner.description}</p>
                  <Button asChild className="w-full">
                    <Link href={`/bridge/${partner.key}?source=brokerage-hub`} className="flex items-center justify-center gap-2">
                      Continue to Partner
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <LeadCaptureForm source={leadSources.BROKERAGE} defaultInterest="Brokerage Support" title="Need Account Opening Help?" />
          </div>
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}
