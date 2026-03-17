import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function () {
      try {
        var key = "finedge-theme";
        var root = document.documentElement;
        var stored = localStorage.getItem(key);
        var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var theme = stored === "dark" || stored === "light" ? stored : (systemDark ? "dark" : "light");
        root.setAttribute("data-theme", theme);
        root.style.colorScheme = theme;
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <div aria-hidden className="finedge-mobile-nav-spacer h-[calc(5.9rem+env(safe-area-inset-bottom))] md:hidden" />
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}

