import { BarChart3, Fingerprint, Lightbulb, MonitorX, Trophy, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES: { icon: LucideIcon; title: string; body: string; className?: string }[] = [
  {
    icon: MonitorX,
    title: "কড়া অ্যান্টি-চিট মোড",
    body: "ট্যাব সুইচ, ফুলস্ক্রিন ত্যাগ, কপি-পেস্ট ও ডেভটুলস ব্লক। ৩টি সতর্কতার পর পরীক্ষা নিজে থেকেই জমা হয়ে যায়।",
    className: "md:col-span-2",
  },
  { icon: Fingerprint, title: "আইডেন্টিটি ওয়াটারমার্ক", body: "স্ক্রিনজুড়ে ফোন নম্বর ও আইপি, তাই প্রশ্ন ফাঁস হলে উৎস খুঁজে পাওয়া যায়।" },
  { icon: Trophy, title: "লাইভ র‍্যাংক", body: "জমা দেওয়ার সাথে সাথেই সারা দেশে তোমার অবস্থান।" },
  { icon: BarChart3, title: "অ্যাকুরেসি বিশ্লেষণ", body: "টপিকভিত্তিক সঠিক-ভুলের চার্ট দেখে দুর্বল জায়গা চিনে নাও।" },
  { icon: Lightbulb, title: "বিস্তারিত ব্যাখ্যা", body: "প্রতিটি প্রশ্নের ধাপে ধাপে সমাধান।", className: "md:col-span-2" },
];

export function Features() {
  return (
    <section className="container py-24" aria-labelledby="features-title">
      <div className="mb-12 max-w-2xl">
        <span className="chip mb-4">
          <Zap className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
          Platform
        </span>
        <h2 id="features-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
          পরীক্ষার হলের মতো নিয়ম, <span className="text-gradient">ঘরে বসেই</span>
        </h2>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body, className }) => (
          <li
            key={title}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-surface-border bg-obsidian-900 p-6 shadow-card transition-all duration-300 hover:border-brand-400/25 hover:shadow-glow",
              className,
            )}
          >
            <span className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <Icon className="mb-5 h-8 w-8 text-brand-400" strokeWidth={1.5} />
            <h3 lang="bn" className="mb-2 text-lg font-semibold text-ink">
              {title}
            </h3>
            <p lang="bn" className="text-sm leading-relaxed text-ink-muted">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
