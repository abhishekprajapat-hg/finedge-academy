import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeaderAuthControls } from "@/components/layout/header-auth-controls";
import { HeaderNavLinks } from "@/components/layout/header-nav-links";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/brokerage", label: "Brokerage/MF" },
  { href: "/insurance", label: "Insurance" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="finedge-header sticky top-0 z-40 border-b border-[#bfd5e8] bg-[rgba(246,251,255,0.9)] backdrop-blur-xl">
      <div className="relative overflow-hidden bg-[linear-gradient(140deg,rgba(255,255,255,0.96),rgba(239,247,255,0.92))]">
        <div aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-[#6ec9cf]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-14 -bottom-16 h-44 w-44 rounded-full bg-[#f4a261]/18 blur-3xl" />

        <div className="site-container">
          <div className="relative flex flex-col gap-3 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Link href="/" prefetch={false} className="group inline-flex w-full items-center gap-3 rounded-2xl border border-[#c5dbec] bg-white/75 px-2.5 py-2 shadow-[0_10px_28px_-24px_rgba(9,30,66,0.7)] transition hover:border-[#9ec5e1] sm:w-auto">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#006d77] via-[#0b7480] to-[#0a4d5d] text-white shadow-[0_16px_30px_-18px_rgba(0,109,119,0.9)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="space-y-0.5">
                  <span className="block text-sm font-bold leading-none tracking-tight text-[#0d1b2a] sm:text-base">FinEdge Academy</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#547693] sm:text-xs">Finance Learning Suite</span>
                </span>
              </Link>

              <HeaderAuthControls />
            </div>

            <div className="hidden lg:block">
              <HeaderNavLinks items={navItems} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

