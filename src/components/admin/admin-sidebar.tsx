"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { ArrowUpRight, BookOpen, FileText, LayoutDashboard, Users, UserSquare2 } from "lucide-react";
import { LogoutButton } from "@/components/forms/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  fullName?: string | null;
  email?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    description: "KPIs and operations",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/leads",
    label: "Lead Inbox",
    description: "CRM and pipeline",
    icon: UserSquare2,
  },
  {
    href: "/admin/courses",
    label: "Courses",
    description: "Catalog and lessons",
    icon: BookOpen,
  },
  {
    href: "/admin/blog",
    label: "Blog CMS",
    description: "Posts and SEO",
    icon: FileText,
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Profiles and risk data",
    icon: Users,
  },
];

export function AdminSidebar({ fullName, email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:overflow-auto">
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin Panel</p>
        <p className="text-lg font-bold text-slate-900">FinEdge Control</p>
        <p className="text-xs text-slate-500">Manage the full platform from one place.</p>
      </div>

      <nav className="mt-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition",
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
              )}
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-slate-500">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href="/" target="_blank" rel="noreferrer">
            View User Website
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Signed in</p>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-slate-900">{fullName || "Admin User"}</p>
          <p className="text-xs text-slate-600">{email || "Admin session"}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
