import Link from "next/link";
import { ArrowUpRight, Compass, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/brokerage", label: "Brokerage" },
  { href: "/insurance", label: "Insurance" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="finedge-footer border-t border-[#c6d8e9] bg-[linear-gradient(180deg,#f7fbff_0%,#edf4fb_100%)]">
      <div className="site-container py-6 md:hidden">
        <div className="rounded-2xl border border-[#d1e1ef] bg-white/85 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4f6e8a]">FinEdge Academy</p>
          <p className="mt-2 text-xs leading-5 text-[#5f7893]">Learning, profiling, and execution support in one mobile-first experience.</p>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="site-container grid gap-8 py-12">
          <div className="grid gap-6 rounded-3xl border border-[#c6d8e9] bg-white/85 p-6 shadow-[0_26px_56px_-40px_rgba(9,30,66,0.5)] lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#3f6384]">
                <Compass className="h-4 w-4 text-[#006d77]" />
                FinEdge Academy
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[#456382]">
                Structured financial learning, risk profiling, and partner-assisted execution workflows for Indian investors and families.
              </p>
              <div className="flex flex-wrap gap-2">
                {footerLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className="inline-flex items-center gap-1 rounded-full border border-[#c6d8e9] bg-[#f5f9fd] px-3 py-1.5 text-xs font-semibold text-[#2c4865] hover:border-[#96bddb] hover:text-[#006d77]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#d6e4f1] bg-[#f4f9ff] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#1c3855]">
                <ShieldCheck className="h-4 w-4 text-[#006d77]" />
                Compliance First
              </p>
              <p className="text-sm text-[#4b6078]">
                Advisory decisions must be validated with registered professionals before execution.
              </p>
              <Link href="/contact" prefetch={false} className="inline-flex items-center gap-1 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]">
                Speak to support
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Disclaimer compact />

          <p className="text-xs text-[#5f7893]">(c) {new Date().getFullYear()} FinEdge Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
