import { Crown } from "lucide-react";
import { cn, toBn } from "@/lib/utils";
import type { TopLearner } from "@/lib/server/landing";

const MEDALS = ["text-brand-300", "text-ink", "text-amber-300"];

export function TopLearners({ learners }: { learners: TopLearner[] }) {
  if (learners.length === 0) return null;

  return (
    <section className="container py-24" aria-labelledby="leaders-title">
      <div className="mb-10 max-w-2xl">
        <span className="chip mb-4">
          <Crown className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
          <span lang="bn">লিডারবোর্ড</span>
        </span>
        <h2 id="leaders-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
          এ পর্যন্ত <span className="text-gradient">সেরা পারফর্মার</span>
        </h2>
        <p lang="bn" className="mt-3 text-ink-muted">
          প্রতিটি পরীক্ষার সেরা পারসেন্টেজ। নাম শুধু প্রথম অংশ দিয়ে দেখানো হয় — বাকিটা গোপন।
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {learners.slice(0, 8).map((l, i) => (
          <li
            key={`${l.name}-${i}`}
            className={cn(
              "flex items-center gap-4 rounded-2xl border border-surface-border bg-obsidian-900 p-4",
              i < 3 && "shadow-glow-sm",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 font-display text-sm font-black",
                MEDALS[i] ?? "text-ink-subtle",
              )}
            >
              {toBn(i + 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p lang="bn" className="truncate font-semibold text-ink">
                {l.name}
              </p>
              <p lang="bn" className="truncate text-xs text-ink-subtle">
                {l.levelName} · {l.streamName}
              </p>
            </div>
            <div className="w-24 shrink-0 text-right">
              <span className="font-display text-lg font-bold tabular-nums text-brand-300">{toBn(l.percent)}%</span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/5">
                <span className="block h-full rounded-full bg-brand-gradient" style={{ width: `${l.percent}%` }} />
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
