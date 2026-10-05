import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Camera, Clock, Gauge, PlayCircle, Target, Trophy } from "lucide-react";
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

      <div className="container space-y-6 pb-10 pt-6 sm:pt-10">
        {/* Profile Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-obsidian-900 shadow-xl">
          {user.coverUrl ? (
            <div className="relative h-28 sm:h-36 w-full overflow-hidden">
              <img src={user.coverUrl} alt="Cover" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/40 to-transparent" />
            </div>
          ) : (
            <div className="relative h-20 sm:h-24 w-full bg-gradient-to-r from-obsidian-950 via-forest to-obsidian-900 opacity-80" />
          )}

          <div className="relative -mt-10 sm:-mt-12 flex flex-col justify-between gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6">
            <div className="flex items-end gap-4">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-4 border-obsidian-900 bg-obsidian-800 shadow-xl ring-2 ring-brand-400/30">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-forest font-display text-3xl font-bold text-brand-300">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 lang="bn" className="text-2xl font-bold text-ink sm:text-3xl">
                    স্বাগতম, {user.name}
                  </h1>
                  <span className="chip text-[11px] py-0.5">
                    <span lang="bn">{LEVELS[level].nameBn} · {STREAMS[stream].nameBn}</span>
                  </span>
                </div>
                {user.institution && (
                  <p lang="bn" className="text-xs text-ink-muted">
                    🏛️ {user.institution}
                  </p>
                )}
                {user.bio && (
                  <p lang="bn" className="text-xs text-ink-subtle italic max-w-md">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/profile"
                className="btn-ghost py-2 text-xs"
              >
                <Camera className="h-3.5 w-3.5 text-brand-400" />
                <span lang="bn">প্রোফাইল ও ছবি এডিট</span>
              </Link>
              <Link href={`/${level}/${stream}`} className="btn-primary py-2 text-xs">
                <BookOpenCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span lang="bn">নতুন পরীক্ষা</span>
              </Link>
            </div>
          </div>
        </div>

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
                        <span lang="bn" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-subtle">
                          <span>{(EXAM_TYPE_META[e.type]?.nameBn ?? "")} · {toBn(e.questions?.length ?? 0)}টি প্রশ্ন · {formatMinutesBn(e.durationSec)}</span>
                          {e.isPaid ? (
                            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                              💳 ৳{toBn(e.price ?? 50)}
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                              🟢 ফ্রি
                            </span>
                          )}
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
