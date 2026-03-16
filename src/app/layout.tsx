import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FinEdge Academy",
    template: "%s | FinEdge Academy",
  },
  description:
    "Financial education, profiling, brokerage and insurance lead platform with an integrated LMS and CRM.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAdminRoute = requestHeaders.get("x-admin-route") === "1";

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <div className="flex min-h-dvh flex-col">
          {isAdminRoute ? null : <SiteHeader />}
          <main className={`flex-1 ${isAdminRoute ? "" : "pb-[5.8rem] md:pb-0"}`}>{children}</main>
          {isAdminRoute ? null : <SiteFooter />}
          {isAdminRoute ? null : <MobileBottomNav />}
        </div>
      </body>
    </html>
  );
}

