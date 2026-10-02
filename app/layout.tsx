import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
// Fallback for 'Ador Noirrit' (self-hosted via @font-face in globals.css).
const banglaFallback = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla-fallback",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ShokherTech Exam BD · SSC & HSC Online Exam",
    template: "%s · ShokherTech Exam BD",
  },
  description:
    "Live MCQ exams, chapter practice and model tests for SSC & HSC students in Bangladesh, with a strict anti-cheat environment and instant analytics.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`dark ${inter.variable} ${jakarta.variable} ${banglaFallback.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
