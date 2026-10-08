import { ClipboardList, Radio, Trophy, Users, type LucideIcon } from "lucide-react";
import { toBn } from "@/lib/utils";
import type { LandingStats } from "@/lib/server/landing";

const ITEMS: { icon: LucideIcon; key: keyof LandingStats; label: string; suffix?: string }[] = [
  { icon: Users, key: "students", label: "নাম নিবন্ধন", suffix: "+" },
  { icon: Radio, key: "exams", label: "প্রকাশিত পরীক্ষা" },
  { icon: ClipboardList, key: "questions", label: "প্রশ্নের ভাণ্ডার", suffix: "+" },
  { icon: Trophy, key: "submissions", label: "জমা দেওয়া পেপার", suffix: "+" },
];

export function StatsStrip({ stats }: { stats: LandingStats }) {
  return (
    <section className="border-y border-surface-border bg-obsidian-800/60" aria-label="প্ল্যাটফর্মের পরিসংখ্যান">
      <div className="container grid grid-cols-2 gap-y-8 py-10 sm:py-12 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, key, label, suffix }) => (
          <div key={key} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-6 w-6 text-brand-400" strokeWidth={1.5} />
            <span className="font-display text-3xl font-black tabular-nums text-ink sm:text-4xl">
              {toBn(stats[key])}
              {suffix && <span className="text-brand-400">{suffix}</span>}
            </span>
            <span lang="bn" className="text-sm text-ink-muted">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
