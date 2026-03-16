import { Clock3, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadSources } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-contact p-7 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-4">
            <p className="kicker border-white/30 bg-white/10 text-[#d4e8f4]">Contact Us</p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Tell us your goal. We will map your next best step.</h1>
            <p className="max-w-2xl text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Whether you need help with portfolio direction, course selection, or insurance and brokerage support, our team will guide you quickly.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#547693]">Support Highlights</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-[#cfe1ee] bg-[#f4f9ff]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="h-4 w-4 text-[#006d77]" />
                    Response Window
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4d6480]">Most consultation requests are reviewed within 24 business hours.</p>
                </CardContent>
              </Card>

              <Card className="border-[#cfe1ee] bg-[#f4f9ff]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-[#006d77]" />
                    Data Handling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4d6480]">Your submitted details are used only for support and consultation follow-up.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="max-w-xl justify-self-start lg:justify-self-end">
            <LeadCaptureForm source={leadSources.CONTACT_PAGE} defaultInterest="Consultation" title="Request a Callback" />
          </div>
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}
