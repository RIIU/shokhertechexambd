import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Baloo_Da_2, Inter, Plus_Jakarta_Sans } from "next/font/google";
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
// Bangla face (Google Fonts, SIL Open Font License). Variable font: weights 400–800.
const bangla = Baloo_Da_2({
  subsets: ["bengali"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
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
        <AppShellProvider>
          <Navbar />
          <MobileMenu />
          <Suspense>{children}</Suspense>
          <Footer />
          <MobileTabBar />
        </AppShellProvider>
      </body>
    </html>
  );
}
