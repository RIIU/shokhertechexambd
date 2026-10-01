import type { Metadata } from "next";
import { PackagesSection } from "@/components/packages/PackagesSection";

export const metadata: Metadata = {
  title: "প্যাকেজ ও সাবস্ক্রিপশন প্ল্যান | ShokherTech Exam BD",
  description: "এসএসসি ও এইচএসসি শিক্ষার্থীদের জন্য সেরা সাশ্রয়ী অনলাইন প্রস্তুতি ও সাবস্ক্রিপশন প্যাকেজ।",
};

export default function PackagesPage() {
  return (
    <main className="min-h-screen py-6 sm:py-10">
      <PackagesSection />
    </main>
  );
}
