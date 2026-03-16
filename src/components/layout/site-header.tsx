import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/forms/logout-button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/brokerage", label: "Brokerage/MF" },
  { href: "/insurance", label: "Insurance" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[#c6d8e9]/80 bg-[rgba(248,252,255,0.86)] backdrop-blur-xl">
      <div className="site-container py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#006d77] to-[#0a4d5d] text-white shadow-[0_15px_34px_-20px_rgba(0,109,119,0.8)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-bold leading-none tracking-tight text-[#0d1b2a] sm:text-base">FinEdge Academy</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#547693] sm:text-xs">Finance Learning Suite</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-[#36506d] md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#006d77]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2 text-xs font-medium text-[#567590] md:hidden">App-style navigation available at bottom bar</p>

        <div className="mt-3 hidden items-center gap-2 rounded-xl border border-[#cfe0ef] bg-white/80 px-3 py-2 text-xs font-semibold text-[#37526f] md:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5 text-[#006d77]" />
          SEBI-aware educational guidance + execution support pipeline
        </div>
      </div>
    </header>
  );
}

