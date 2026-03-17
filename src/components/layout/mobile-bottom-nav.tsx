"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesColumn, House, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: House,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/courses",
    label: "Courses",
    icon: BookOpen,
    isActive: (pathname) => pathname.startsWith("/courses"),
  },
  {
    href: "/blog",
    label: "Blog",
    icon: MessageCircle,
    isActive: (pathname) => pathname.startsWith("/blog"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith("/profile"),
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: ChartNoAxesColumn,
    isActive: (pathname) => pathname.startsWith("/dashboard"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="finedge-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-[#c6d8e9]/90 bg-[rgba(247,252,255,0.95)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-around px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "finedge-mobile-nav-link flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition",
                active ? "bg-[#dff3f2] text-[#055b64]" : "text-[#4d6480]",
                active ? "is-active" : "is-inactive",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className={cn("finedge-mobile-nav-icon h-4 w-4", active ? "text-[#006d77]" : "text-[#62819c]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
