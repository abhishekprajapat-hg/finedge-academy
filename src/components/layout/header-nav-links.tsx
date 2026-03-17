"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type HeaderNavItem = {
  href: string;
  label: string;
};

type HeaderNavLinksProps = {
  items: HeaderNavItem[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLinks({ items }: HeaderNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="header-nav-pill flex flex-wrap items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-[#cadeee] bg-white/70 p-1.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={cn(
              "header-nav-link whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] transition-all duration-200 lg:px-3 lg:text-sm",
              active
                ? "bg-gradient-to-r from-[#006d77] to-[#0a5964] text-white shadow-[0_12px_24px_-16px_rgba(0,109,119,0.85)]"
                : "text-[#36506d] hover:bg-[#e8f2fb] hover:text-[#0a4d6e]",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
