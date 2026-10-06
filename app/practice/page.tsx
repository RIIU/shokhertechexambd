import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { MistakesArt, PracticeArt } from "@/components/illustrations/Illustrations";
import { SubjectIcon } from "@/components/subjects/SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { getCurrentUser } from "@/lib/server/auth";
import { practiceCatalog, recentMistakes } from "@/lib/server/practice";
import { LEVELS, STREAMS, STREAM_IDS, isLevel, isStream } from "@/lib/data/catalog";
import { cn, toBn } from "@/lib/utils";
import type { Level, StreamId } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "প্রশ্ন ব্যাংক ও প্র্যাকটিস",
  description: "এসএসসি ও এইচএসসির প্রতিটি বিষয়ের অধ্যায়ভিত্তিক প্রশ্ন ব্যাংক। উত্তর দিলেই জানো সঠিক না ভুল, সাথে ব্যাখ্যা।",
};

export default async function PracticePage({ searchParams }: { searchParams: { level?: string; stream?: string } }) {
  const user = await getCurrentUser();
  const level: Level = isLevel(searchParams.level ?? "") ? (searchParams.level as Level) : user?.level ?? "ssc";
  const stream: StreamId = isStream(searchParams.stream ?? "") ? (searchParams.stream as StreamId) : user?.stream ?? "science";

  const [catalog, mistakes] = await Promise.all([practiceCatalog(level, stream, user?.id), user ? recentMistakes(user.id) : Promise.resolve([])]);
  const totalSets = catalog.reduce((n, c) => n + c.sets.length, 0);
  const totalQuestions = catalog.reduce((n, c) => n + c.questions, 0);
  const href = (l: Level, s: StreamId) => `/practice?level=${l}&stream=${s}`;

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-brand" />

      <section className="container pb-8 pt-8 sm:pt-12">
        <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p lang="bn" className="mb-2 text-sm font-semibold text-brand-300">
              প্রশ্ন ব্যাংক
            </p>
            <h1 lang="bn" className="mb-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              প্র্যাকটিস করো, শিখে নাও
            </h1>
            <p lang="bn" className="max-w-xl text-lg text-ink-muted">
              বিষয় আর অধ্যায় বেছে নাও। প্রতিটি উত্তরের সাথে সাথেই জানবে সঠিক না ভুল, সাথে সহজ ব্যাখ্যা।
            </p>
            <p lang="bn" className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-subtle">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> {toBn(totalSets)}টি প্র্যাকটিস সেট
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {toBn(totalQuestions)}টি প্রশ্ন
              </span>
            </p>
          </div>
          <PracticeArt className="h-28 w-28 shrink-0 sm:h-40 sm:w-40" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav aria-label="স্তর" className="inline-flex self-start rounded-xl border border-surface-border bg-obsidian-900/60 p-1">
            {(["ssc", "hsc"] as const).map((l) => (
              <Link
                key={l}
                href={href(l, stream)}
                lang="bn"
                aria-current={l === level ? "page" : undefined}
                className={cn("rounded-lg px-4 py-1.5 text-sm font-bold", l === level ? "bg-brand-400 text-forest" : "text-ink-muted hover:text-ink")}
              >
                {LEVELS[l].nameBn}
              </Link>
            ))}
          </nav>
          <nav aria-label="বিভাগ" className="flex flex-wrap gap-2">
            {STREAM_IDS.map((s) => (
              <Link
                key={s}
                href={href(level, s)}
                lang="bn"
                aria-current={s === stream ? "page" : undefined}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-sm",
                  s === stream ? "border-brand-400/50 bg-brand-400/10 font-semibold text-brand-200" : "border-white/10 text-ink-muted hover:text-ink",
                )}
              >
                {STREAMS[s].nameBn}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="container pb-20">
        {user && mistakes.length > 0 && (
          <Link
            href="/practice/mistakes"
            className="group mb-6 flex items-center gap-4 rounded-3xl border border-amber-400/30 bg-amber-400/[0.06] p-4 transition-colors hover:border-amber-400/50 sm:p-5"
          >
            <MistakesArt className="h-16 w-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <p lang="bn" className="font-semibold text-ink">
                ভুলগুলো আবার দেখো
              </p>
              <p lang="bn" className="text-sm text-ink-muted">
                সাম্প্রতিক {toBn(mistakes.length)}টি ভুল প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যাসহ।
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-300 transition-transform group-hover:translate-x-1" />
          </Link>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map(({ subject, sets, questions, done }) => {
            const accent = ACCENT_STYLES[subject.accent];
            const pct = sets.length ? Math.round((done / sets.length) * 100) : 0;
            const body = (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1", accent.bg, accent.text, accent.ring)}>
                    <SubjectIcon icon={subject.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p lang="bn" className="truncate text-lg font-bold text-ink">
                      {subject.nameBn}
                    </p>
                    <p className="text-xs text-ink-subtle">
                      {subject.nameEn} · {subject.code}
                    </p>
                  </div>
                </div>
                {sets.length ? (
                  <>
                    <p lang="bn" className="mb-2 flex justify-between text-sm text-ink-muted">
                      <span>
                        {toBn(sets.length)}টি সেট · {toBn(questions)}টি প্রশ্ন
                      </span>
                      <span className="font-semibold text-ink">{toBn(pct)}%</span>
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                    </div>
                  </>
                ) : (
                  <p lang="bn" className="text-sm text-ink-subtle">
                    প্রশ্ন শীঘ্রই আসছে
                  </p>
                )}
              </>
            );
            return (
              <li key={subject.id}>
                {sets.length ? (
                  <Link
                    href={`/practice/${subject.id}?level=${level}&stream=${stream}`}
                    className="block h-full rounded-3xl border border-surface-border bg-obsidian-800/70 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-400/40 hover:shadow-glow-sm"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-surface-border p-5 opacity-60">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
