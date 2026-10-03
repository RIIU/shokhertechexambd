import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock, Gauge, PlayCircle, Target, Trophy } from "lucide-react";
import { EmptyState, Panel, StatTile } from "@/components/ui/StatTile";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { requireUser } from "@/lib/server/auth";
import { studentDashboard } from "@/lib/server/stats";
import { listExams } from "@/lib/server/exams";
import { EXAM_TYPE_META, LEVELS, STREAMS } from "@/lib/data/catalog";
import { cn, formatDateBn, formatMinutesBn, toBn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const data = await studentDashboard(user.id);
  const level = user.level ?? "ssc";
  const stream = user.stream ?? "science";
  const takenIds = new Set(data.recent.map((r) => r.examId));
  const suggestions = (await listExams({ level, stream, publishedOnly: true }))
    .sort((a, b) => Number(b.type === "live") - Number(a.type === "live"))
    .filter((e) => !(e.type === "live" && takenIds.has(e.id)))
    .slice(0, 4);

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-brand" />

      <div className="container space-y-6 pb-10 pt-8 sm:pt-12">
        {/* Greeting */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="chip mb-3">
              <span lang="bn">
                {LEVELS[level].nameBn} · {STREAMS[stream].nameBn}
                {user.institution ? ` · ${user.institution}` : ""}
              </span>
            </p>
            <h1 lang="bn" className="text-3xl font-bold text-ink sm:text-4xl">
              স্বাগতম, <span className="text-gradient">{user.name}</span>
            </h1>
          </div>
          <Link href={`/${level}/${stream}`} className="btn-primary self-start sm:self-auto">
            <BookOpenCheck className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">নতুন পরীক্ষা দাও</span>
          </Link>
        </header>

        {/* In-progress attempts */}
        {data.inProgress.length > 0 && (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-400/[0.06] p-4 sm:p-5">
            <p lang="bn" className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200">
              <Clock className="h-4 w-4" /> চলমান পরীক্ষা: সময় চলছে
            </p>
            <ul className="space-y-2">
              {data.inProgress.map((r) => (
                <li key={r.attemptId}>
                  <Link
                    href={`/exam/${r.examId}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-obsidian-900 px-4 py-3 hover:border-amber-400/50"
                  >
                    <span lang="bn" className="truncate text-sm text-ink">
                      {r.titleBn}
                    </span>
                    <span lang="bn" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-300">
                      চালিয়ে যাও <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={BookOpenCheck} label="মোট পরীক্ষা" value={toBn(data.totals.taken)} hint="জমা দেওয়া পরীক্ষা" />
          <StatTile icon={Gauge} label="গড় স্কোর" value={`${toBn(data.totals.avgPercent)}%`} hint="পূর্ণমানের তুলনায়" tone="leaf" />
          <StatTile icon={Target} label="গড় নির্ভুলতা" value={`${toBn(data.totals.avgAccuracy)}%`} hint="উত্তর দেওয়া প্রশ্নে" tone="leaf" />
          <StatTile
            icon={Trophy}
            label="সেরা র‍্যাংক"
            value={data.totals.bestRank ? `#${toBn(data.totals.bestRank)}` : "—"}
            hint="যেকোনো পরীক্ষায়"
            tone="amber"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="স্কোরের অগ্রগতি">
            {data.trend.length >= 2 ? (
              <>
                <ScoreTrendChart data={data.trend} />
                <p lang="bn" className="mt-2 text-xs text-ink-subtle">
                  শেষ {toBn(data.trend.length)}টি পরীক্ষার স্কোর (%), পুরোনো থেকে নতুন
                </p>
              </>
            ) : (
              <EmptyState text="অন্তত ২টি পরীক্ষা দিলে এখানে তোমার অগ্রগতির গ্রাফ দেখা যাবে।" />
            )}
          </Panel>

          <Panel title="বিষয়ভিত্তিক দক্ষতা">
            {data.subjects.length ? (
              <ul className="space-y-4">
                {data.subjects.map((s) => (
                  <li key={s.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span lang="bn" className="text-ink">
                        {s.name}
                      </span>
                      <span lang="bn" className="text-ink-muted">
                        {toBn(s.percent)}% · {toBn(s.count)}টি পরীক্ষা
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-pill">
                      <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.max(2, s.percent)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="এখনো কোনো পরীক্ষা দাওনি।" />
            )}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="সাম্প্রতিক ফলাফল">
            {data.recent.length ? (
              <ul className="divide-y divide-surface-border">
                {data.recent.map((r) => (
                  <li key={r.attemptId}>
                    <Link href={`/results/${r.attemptId}`} className="group flex items-center gap-4 py-3">
                      <span className="min-w-0 flex-1">
                        <span lang="bn" className="block truncate text-sm font-medium text-ink group-hover:text-brand-300">
                          {r.titleBn}
                        </span>
                        <span lang="bn" className="block text-xs text-ink-subtle">
                          {EXAM_TYPE_META[r.type].nameBn} · {r.submittedAt ? formatDateBn(r.submittedAt, true) : ""}
                          {r.strikes > 0 && <span className="text-rose-300"> · সতর্কতা {toBn(r.strikes)}</span>}
                        </span>
                      </span>
                      <span className="text-right">
                        <span lang="bn" className="block font-display text-base font-bold text-ink">
                          {toBn(r.score ?? 0)}/{toBn(r.totalMarks ?? 0)}
                        </span>
                        <span lang="bn" className="block text-xs text-ink-subtle">
                          র‍্যাংক #{toBn(r.rank ?? 0)}/{toBn(r.participants ?? 0)}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                text="তোমার ফলাফল এখানে জমা থাকবে।"
                action={
                  <Link href={`/${level}/${stream}`} className="btn-primary">
                    <span lang="bn">প্রথম পরীক্ষা দাও</span>
                  </Link>
                }
              />
            )}
          </Panel>

          <Panel title="তোমার জন্য পরীক্ষা">
            {suggestions.length ? (
              <ul className="space-y-2">
                {suggestions.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/exam/${e.id}`}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                        e.type === "live" ? "border-state-danger/30 hover:shadow-glow-danger" : "border-surface-border hover:border-brand-400/50",
                      )}
                    >
                      <PlayCircle className={cn("h-5 w-5 shrink-0", e.type === "live" ? "text-rose-300" : "text-brand-400")} strokeWidth={1.5} />
                      <span className="min-w-0 flex-1">
                        <span lang="bn" className="block truncate text-sm font-medium text-ink">
                          {e.titleBn}
                        </span>
                        <span lang="bn" className="block text-xs text-ink-subtle">
                          {EXAM_TYPE_META[e.type].nameBn} · {toBn(e.questions.length)}টি প্রশ্ন · {formatMinutesBn(e.durationSec)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="তোমার বিভাগের জন্য এখনো কোনো পরীক্ষা প্রকাশিত হয়নি।" />
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
