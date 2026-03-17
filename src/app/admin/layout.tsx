import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCurrentUser } from "@/lib/auth";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const hideSiteShell = (
    <style>{`
      header,
      footer,
      .finedge-mobile-nav,
      .finedge-mobile-nav-spacer {
        display: none !important;
      }
    `}</style>
  );

  if (!isAdmin) {
    return (
      <>
        {hideSiteShell}
        <div className="min-h-dvh bg-slate-100 px-4 py-10">{children}</div>
      </>
    );
  }

  return (
    <>
      {hideSiteShell}
      <div className="min-h-dvh bg-slate-100 p-4 lg:p-6">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
          <AdminSidebar fullName={user.fullName} email={user.email} />
          <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
