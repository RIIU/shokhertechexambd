"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Gauge,
  Lightbulb,
  Lock,
  MinusCircle,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { AccuracyDonut, TopicBars } from "@/components/result/ResultCharts";
import { ShareResult } from "@/components/result/ShareResult";
import { percentileOf, verdictFor } from "@/lib/result-copy";
import { cn, formatClock, OPTION_LABEL_BN, toBn } from "@/lib/utils";
import type { ExamResult, QuestionResult } from "@/lib/types";

gsap.registerPlugin(useGSAP);

type Filter = "all" | QuestionResult["status"];
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "সব" },
  { id: "correct", label: "সঠিক" },
  { id: "wrong", label: "ভুল" },
  { id: "skipped", label: "বাদ" },
];

const REASON_COPY: Record<ExamResult["reason"], string | null> = {
  manual: null,
  "time-up": "সময় শেষ হওয়ায় পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়েছে।",
  "max-warnings": "সর্বোচ্চ সতর্কতার সীমা পার হওয়ায় পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়েছে।",
};

export interface ResultMeta {
  subjectBn?: string;
  levelBn: string;
  streamBn: string;
  typeBn: string;
  negativeMark: number;
}

interface ResultViewProps {
  result: ExamResult;
  meta?: ResultMeta;
  /** Live exams can be taken once, so no "try again" button. */
  canRetake: boolean;
  /** Shown when an admin is viewing someone else's result. */
  studentName?: string;
  backHref: string;
  backLabel: string;
  showSolutions?: boolean;
  /** Public link for the owner to share (absent for admins viewing others). */
  sharePath?: string;
  /** Who the shared card is about (the owner). */
  sharer?: { name: string; institution?: string };
  leaderboardHref?: string;
}

export function ResultView({
  result,
  meta,
  canRetake,
  studentName,
  backHref,
  backLabel,
  showSolutions = true,
  sharePath,
  sharer,
  leaderboardHref,
}: ResultViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const scoreRef = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const counter = { v: 0 };
      gsap.to(counter, {
        v: result.score,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          if (scoreRef.current) scoreRef.current.textContent = toBn(Number(counter.v.toFixed(2)));
        },
      });
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-stat]", { opacity: 0, y: 16, stagger: 0.06, duration: 0.5, ease: "power3.out", delay: 0.15 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [result] },
  );

  const solutionsAllowed = showSolutions !== false && result.showSolutions !== false;
  const questions = useMemo(() => result.questions.filter((q) => filter === "all" || q.status === filter), [result, filter]);

  const pct = result.totalMarks > 0 ? Math.max(0, (result.score / result.totalMarks) * 100) : 0;
  const verdict = verdictFor(pct);
  const percentile = percentileOf(result.rank, result.participants);
  const answered = result.correct + result.wrong;
  const perQuestion = answered ? Math.round(result.timeTakenSec / answered) : 0;
  const lostToNegative = meta ? result.wrong * meta.negativeMark : 0;
  const reason = REASON_COPY[result.reason];

  const topicStats = result.topics
    .filter((t) => t.total > 0)
    .map((t) => ({ ...t, pct: Math.round((t.correct / t.total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  const strong = topicStats.filter((t) => t.pct >= 75);
  const weak = topicStats.filter((t) => t.pct < 50).reverse();

  const stats = [
    {
      icon: Trophy,
      label: "র‍্যাংক",
      value: `#${toBn(result.rank)}`,
      sub: `${toBn(result.participants)} জনের মধ্যে`,
    },
    { icon: Target, label: "নির্ভুলতা", value: `${toBn(result.accuracy)}%`, sub: `${toBn(answered)}টি উত্তর দিয়েছ` },
    { icon: Clock, label: "সময়", value: formatClock(result.timeTakenSec), sub: perQuestion ? `প্রতি প্রশ্নে গড়ে ${toBn(perQuestion)} সেকেন্ড` : "মিনিট:সেকেন্ড" },
    lostToNegative > 0
      ? { icon: TrendingDown, label: "নেগেটিভ মার্কিং", value: `−${toBn(Number(lostToNegative.toFixed(2)))}`, sub: `${toBn(result.wrong)}টি ভুল উত্তরে কাটা` }
      : { icon: AlertTriangle, label: "সতর্কতা", value: toBn(result.strikes), sub: result.strikes ? "অ্যাডমিনকে জানানো হয়েছে" : "পরিচ্ছন্ন পরীক্ষা" },
  ];

  return (
    <main ref={root} className="relative">
      <div className="page-backdrop" />

      <section className="container max-w-5xl pb-20 pt-8 sm:pt-12">
        <Link href={backHref} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          <span lang="bn">{backLabel}</span>
        </Link>

        {reason && (
          <p lang="bn" role="status" className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {reason}
          </p>
        )}

        {/* Summary */}
        <div className="card mb-6 overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
              <ScoreRing pct={pct}>
                <span className="flex items-baseline gap-1">
                  <span ref={scoreRef} lang="bn" className="font-display text-4xl font-bold text-ink">
                    {toBn(0)}
                  </span>
                  <span lang="bn" className="text-base font-semibold text-ink-subtle">
                    /{toBn(result.totalMarks)}
                  </span>
                </span>
                <span lang="bn" className="text-xs text-ink-subtle">
                  প্রাপ্ত নম্বর
                </span>
              </ScoreRing>
            </div>

            <div className="min-w-0">
              <p lang="bn" className="mb-1 text-sm text-ink-subtle">
                {[meta?.subjectBn, meta?.typeBn, studentName].filter(Boolean).join(" · ") || "ফলাফল"}
              </p>
              <h1 lang="bn" className="mb-4 text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
                {result.titleBn}
              </h1>
              <div className="mb-5 flex items-start gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-400/15">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" strokeWidth={1.75} />
                <div>
                  <p lang="bn" className="font-semibold text-brand-200">
                    {verdict.title}
                    {result.participants > 1 && (
                      <span className="font-normal text-ink-muted"> · তুমি {toBn(percentile)}% শিক্ষার্থীর চেয়ে ভালো করেছ</span>
                    )}
                  </p>
                  <p lang="bn" className="text-sm text-ink-muted">
                    {verdict.note}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sharePath && sharer && (
                  <ShareResult
                    sharePath={sharePath}
                    title={result.titleBn}
                    score={result.score}
                    total={result.totalMarks}
                    rank={result.rank}
                    participants={result.participants}
                    card={{
                      name: sharer.name,
                      institution: sharer.institution,
                      titleBn: result.titleBn,
                      subtitle: [meta?.subjectBn, meta?.levelBn, meta?.typeBn].filter(Boolean).join(" · "),
                      score: result.score,
                      total: result.totalMarks,
                      rank: result.rank,
                      participants: result.participants,
                      accuracy: result.accuracy,
                      timeTakenSec: result.timeTakenSec,
                      verdict: verdict.title,
                    }}
                  />
                )}
                {leaderboardHref && (
                  <Link href={leaderboardHref} className="btn-ghost">
                    <Trophy className="h-4 w-4" strokeWidth={1.75} />
                    <span lang="bn">লিডারবোর্ড</span>
                  </Link>
                )}
                {canRetake && (
                  <Link href={`/exam/${result.examId}`} className="btn-ghost">
                    <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                    <span lang="bn">আবার দাও</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 border-t border-surface-border lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value, sub }, i) => (
              <div
                key={label}
                data-stat
                className={cn(
                  "p-5 sm:p-6",
                  i % 2 === 1 && "border-l border-surface-border",
                  i >= 2 && "border-t border-surface-border lg:border-t-0",
                  i === 2 && "lg:border-l",
                )}
              >
                <dt className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-subtle">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span lang="bn">{label}</span>
                </dt>
                <dd lang="bn" className="font-display text-2xl font-bold text-ink">
                  {value}
                </dd>
                <dd lang="bn" className="text-xs text-ink-subtle">
                  {sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Analysis */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-6" aria-labelledby="acc-title">
            <h2 id="acc-title" lang="bn" className="mb-5 text-lg font-semibold text-ink">
              উত্তরের বিশ্লেষণ
            </h2>
            <AccuracyDonut result={result} />
          </section>
          <section className="card p-6" aria-labelledby="topic-title">
            <h2 id="topic-title" lang="bn" className="mb-5 text-lg font-semibold text-ink">
              টপিকভিত্তিক দক্ষতা
            </h2>
            <TopicBars result={result} />
          </section>
        </div>

        {(strong.length > 0 || weak.length > 0) && (
          <section className="mb-10 grid gap-4 sm:grid-cols-2" aria-label="পরামর্শ">
            <InsightCard
              tone="good"
              icon={TrendingUp}
              title="শক্তিশালী টপিক"
              empty="এখনো কোনো টপিকে ৭৫%+ হয়নি।"
              topics={strong}
            />
            <InsightCard
              tone="bad"
              icon={Gauge}
              title="আরও অনুশীলন দরকার"
              empty="কোনো টপিকে ৫০%-এর নিচে নেই। চমৎকার!"
              topics={weak}
            />
          </section>
        )}

        {/* Review */}
        <section aria-labelledby="exp-title">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="exp-title" lang="bn" className="text-2xl font-bold tracking-tight text-ink">
              সমাধান ও ব্যাখ্যা
            </h2>
            {solutionsAllowed && (
              <div role="tablist" className="inline-flex self-start rounded-xl bg-surface-hover p-1">
                {FILTERS.map((f) => {
                  const count = f.id === "all" ? result.questions.length : result[f.id];
                  return (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={filter === f.id}
                      onClick={() => setFilter(f.id)}
                      className={cn("relative rounded-lg px-3.5 py-1.5 text-sm font-medium", filter === f.id ? "text-ink" : "text-ink-muted hover:text-ink")}
                    >
                      {filter === f.id && (
                        <motion.span layoutId="exp-filter" className="absolute inset-0 rounded-lg bg-white shadow-card ring-1 ring-surface-border" />
                      )}
                      <span lang="bn" className="relative">
                        {f.label} <span className="text-ink-subtle">{toBn(count)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!solutionsAllowed ? (
            <div className="card p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                <Lock className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 lang="bn" className="mb-2 text-lg font-bold text-ink">
                সমাধান এই মুহূর্তে বন্ধ
              </h3>
              <p lang="bn" className="mx-auto max-w-lg text-sm leading-relaxed text-ink-muted">
                এই পরীক্ষার সঠিক উত্তর ও ব্যাখ্যা অ্যাডমিন গোপন রেখেছেন। তোমার স্কোর, সময়, নির্ভুলতা আর র‍্যাংক উপরে দেখতে পাচ্ছ।
              </p>
            </div>
          ) : (
            <>
              <nav aria-label="প্রশ্নে যাও" className="mb-5 flex flex-wrap gap-1.5">
                {result.questions.map((q, i) => (
                  <a
                    key={q.id}
                    href={`#q-${i + 1}`}
                    onClick={() => setFilter("all")}
                    lang="bn"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold ring-1 transition-transform hover:-translate-y-0.5",
                      q.status === "correct" && "bg-brand-50 text-brand-200 ring-brand-400/25",
                      q.status === "wrong" && "bg-rose-50 text-rose-700 ring-rose-500/25",
                      q.status === "skipped" && "bg-white text-ink-subtle ring-surface-border",
                    )}
                    title={STATUS_META[q.status].label}
                  >
                    {toBn(i + 1)}
                  </a>
                ))}
              </nav>
              <ol className="space-y-4">
                {questions.map((q) => (
                  <ExplanationCard key={q.id} q={q} number={result.questions.indexOf(q) + 1} />
                ))}
              </ol>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function ScoreRing({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#EAECF0" strokeWidth="10" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(100, pct) / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#12B76A" />
            <stop offset="100%" stopColor="#08804A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function InsightCard({
  tone,
  icon: Icon,
  title,
  empty,
  topics,
}: {
  tone: "good" | "bad";
  icon: typeof TrendingUp;
  title: string;
  empty: string;
  topics: { topic: string; correct: number; total: number; pct: number }[];
}) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg ring-1",
            tone === "good" ? "bg-brand-50 text-brand-400 ring-brand-400/20" : "bg-amber-50 text-amber-600 ring-amber-500/20",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span lang="bn">{title}</span>
      </h3>
      {topics.length ? (
        <ul className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <li
              key={t.topic}
              lang="bn"
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs ring-1",
                tone === "good" ? "bg-brand-50/60 text-brand-200 ring-brand-400/15" : "bg-amber-50/70 text-amber-800 ring-amber-500/15",
              )}
            >
              {t.topic} <span className="opacity-70">· {toBn(t.pct)}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p lang="bn" className="text-sm text-ink-subtle">
          {empty}
        </p>
      )}
    </div>
  );
}

const STATUS_META: Record<QuestionResult["status"], { icon: typeof CheckCircle2; label: string; cls: string }> = {
  correct: { icon: CheckCircle2, label: "সঠিক", cls: "text-brand-200 bg-brand-50 ring-brand-400/20" },
  wrong: { icon: XCircle, label: "ভুল", cls: "text-rose-700 bg-rose-50 ring-rose-500/20" },
  skipped: { icon: MinusCircle, label: "উত্তর দেওয়া হয়নি", cls: "text-ink-muted bg-surface-hover ring-surface-border" },
};

function ExplanationCard({ q, number }: { q: QuestionResult; number: number }) {
  const meta = STATUS_META[q.status];
  const Icon = meta.icon;
  return (
    <li id={`q-${number}`} className="card scroll-mt-24 p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span lang="bn" className="font-display text-sm font-bold text-ink-subtle">
          প্রশ্ন {toBn(number)}
        </span>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1", meta.cls)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span lang="bn">{meta.label}</span>
        </span>
        <span lang="bn" className="chip">
          {q.topic}
        </span>
      </div>
      <p lang="bn" className="mb-4 text-base font-semibold text-ink">
        {q.text}
      </p>
      <ul className="mb-4 grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const isCorrect = o.id === q.correctOptionId;
          const isWrongPick = o.id === q.selectedOptionId && !isCorrect;
          return (
            <li
              key={o.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-sm",
                isCorrect && "border-brand-400/40 bg-brand-50 text-ink",
                isWrongPick && "border-rose-500/30 bg-rose-50 text-ink",
                !isCorrect && !isWrongPick && "border-surface-border text-ink-muted",
              )}
            >
              <span
                lang="bn"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  isCorrect ? "bg-brand-400 text-white" : isWrongPick ? "bg-rose-600 text-white" : "border border-surface-border bg-white",
                )}
              >
                {OPTION_LABEL_BN[o.id]}
              </span>
              <span lang="bn" className="flex-1">
                {o.text}
              </span>
              {isCorrect && <CheckCircle2 className="h-4 w-4 text-brand-400" aria-label="সঠিক উত্তর" />}
              {isWrongPick && <XCircle className="h-4 w-4 text-rose-600" aria-label="তোমার উত্তর" />}
            </li>
          );
        })}
      </ul>
      {q.explanation && (
        <div className="flex gap-3 rounded-xl bg-surface-soft p-4 ring-1 ring-surface-border">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.75} />
          <p lang="bn" className="text-sm leading-relaxed text-ink-muted">
            {q.explanation}
          </p>
        </div>
      )}
    </li>
  );
}
