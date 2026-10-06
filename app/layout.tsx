import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Inter, Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import { AppShellProvider } from "@/components/layout/AppShell";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu").then((m) => m.MobileMenu), { ssr: false });
const MobileTabBar = dynamic(() => import("@/components/layout/MobileTabBar").then((m) => m.MobileTabBar), { ssr: false });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
// Bangla face (Google Fonts, SIL Open Font License): clear conjuncts at small
// sizes and a full weight range. Variable font, self-hosted by next/font.
const bangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bangla",
  display: "swap",
});

// Absolute base for og:image and share links: an explicit site URL, else
// Vercel's production domain, else local dev.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shokher Tech Academy · SSC & HSC Online Exam",
    template: "%s · Shokher Tech Academy",
  },
  description:
    "Live MCQ exams, chapter practice and model tests for SSC & HSC students in Bangladesh, with a strict anti-cheat environment and instant analytics.",
};

export const viewport: Viewport = {
  themeColor: "#002417",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`dark ${inter.variable} ${jakarta.variable} ${bangla.variable}`}>
      <body>
        {/* Single page-level root (display: contents, so no layout effect): anything else the
            anti-cheat layer finds directly under <body> was injected by an extension. */}
        <div data-app-root style={{ display: "contents" }}>
          <AppShellProvider>
            <Navbar />
            <MobileMenu />
            <Suspense>{children}</Suspense>
            <Footer />
            <MobileTabBar />
          </AppShellProvider>
        </div>
      </body>
    </html>
  );
}
