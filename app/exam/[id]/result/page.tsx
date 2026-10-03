"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Home, Lightbulb, MinusCircle, RotateCcw, Target, Trophy, XCircle } from "lucide-react";
import { AccuracyDonut, TopicBars } from "@/components/result/ResultCharts";
import { cn, formatClock, OPTION_LABEL_BN, toBn } from "@/lib/utils";
import { resultStorageKey } from "@/lib/hooks/useExamSession";
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

export default function ResultPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<ExamResult | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>("all");
  const scoreRef = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(resultStorageKey(params.id));
      setResult(raw ? (JSON.parse(raw) as ExamResult) : null);
    } catch {
      setResult(null);
    }
  }, [params.id]);

  useGSAP(
    () => {
      if (!result) return;
      const counter = { v: 0 };
      gsap.to(counter, {
        v: result.score,
        duration: 1.4,
        ease: "power3.out",
        onUpdate: () => {
          if (scoreRef.current) scoreRef.current.textContent = toBn(Number(counter.v.toFixed(2)));
        },
      });
      gsap.from("[data-stat]", { opacity: 0, y: 24, stagger: 0.08, duration: 0.7, ease: "power3.out", delay: 0.2 });
    },
    { scope: root, dependencies: [result] },
  );

  const questions = useMemo(
    () => (result ? result.questions.filter((q) => filter === "all" || q.status === filter) : []),
    [result, filter],
  );

  if (result === undefined) return <main className="min-h-screen" />;

  if (result === null) {
    return (
      <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p lang="bn" className="mb-6 text-ink-muted">
          এই পরীক্ষার কোনো ফলাফল এই ডিভাইসে পাওয়া যায়নি।
        </p>
        <Link href={`/exam/${params.id}`} className="btn-primary">
          <span lang="bn">পরীক্ষা দাও</span>
        </Link>
      </main>
    );
  }

  const pct = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
  const reason = REASON_COPY[result.reason];

  const stats = [
    { icon: Trophy, label: "র‍্যাংক", value: `#${toBn(result.rank.toLocaleString("en-US"))}`, sub: `${toBn(result.participants.toLocaleString("en-US"))} জনের মধ্যে` },
    { icon: Target, label: "নির্ভুলতা", value: `${toBn(result.accuracy)}%`, sub: `${toBn(result.correct + result.wrong)}টি উত্তর দিয়েছ` },
    { icon: Clock, label: "সময় লেগেছে", value: formatClock(result.timeTakenSec), sub: "মিনিট:সেকেন্ড" },
    { icon: AlertTriangle, label: "সতর্কতা", value: toBn(result.strikes), sub: result.strikes ? "অ্যাডমিনকে জানানো হয়েছে" : "পরিচ্ছন্ন পরীক্ষা" },
  ];

  return (
    <main ref={root} className="relative overflow-x-clip">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-radial-brand" />

      <section className="container pt-10 sm:pt-14">
        {reason && (
          <p lang="bn" role="status" className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200 ring-1 ring-amber-400/25">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {reason}
          </p>
        )}

        {/* Score card */}
        <div className="border-animated animate-border-spin mb-6 grid gap-8 rounded-4xl p-6 shadow-glow-lg sm:p-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Result</p>
            <h1 lang="bn" className="mb-6 text-2xl font-bold text-ink">
              {result.titleBn}
            </h1>
            <p className="flex items-end gap-2">
              <span ref={scoreRef} lang="bn" className="font-display text-7xl font-black leading-none text-gradient">
                {toBn(0)}
              </span>
              <span lang="bn" className="mb-2 font-display text-2xl font-semibold text-ink-muted">
                / {toBn(result.totalMarks)}
              </span>
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-brand-gradient shadow-glow"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} data-stat className="rounded-2xl border border-surface-border bg-white/[0.02] p-4">
                <dt className="mb-2 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
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

        {/* Analytics */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <section className="glass rounded-3xl p-6" aria-labelledby="acc-title">
            <h2 id="acc-title" lang="bn" className="mb-5 text-lg font-semibold text-ink">
              উত্তরের বিশ্লেষণ
            </h2>
            <AccuracyDonut result={result} />
          </section>
          <section className="glass rounded-3xl p-6" aria-labelledby="topic-title">
            <h2 id="topic-title" lang="bn" className="mb-5 text-lg font-semibold text-ink">
              টপিকভিত্তিক দক্ষতা
            </h2>
            <TopicBars result={result} />
          </section>
        </div>

        {/* Explanations */}
        <section aria-labelledby="exp-title">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="exp-title" lang="bn" className="text-2xl font-bold text-ink">
              সমাধান ও ব্যাখ্যা
            </h2>
            <div role="tablist" className="glass inline-flex self-start rounded-2xl p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn("relative rounded-xl px-4 py-2 text-sm", filter === f.id ? "text-forest" : "text-ink-muted hover:text-ink")}
                >
                  {filter === f.id && <motion.span layoutId="exp-filter" className="absolute inset-0 rounded-xl bg-brand-400" />}
                  <span lang="bn" className="relative">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <ol className="space-y-4">
            {questions.map((q) => (
              <ExplanationCard key={q.id} q={q} number={result.questions.indexOf(q) + 1} />
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/ssc/science" className="btn-ghost">
            <Home className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">বিষয়ে ফিরে যাও</span>
          </Link>
          <Link href={`/exam/${result.examId}`} className="btn-primary">
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">আবার পরীক্ষা দাও</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

const STATUS_META: Record<QuestionResult["status"], { icon: typeof CheckCircle2; label: string; cls: string }> = {
  correct: { icon: CheckCircle2, label: "সঠিক", cls: "text-brand-300 bg-brand-400/10 ring-brand-400/30" },
  wrong: { icon: XCircle, label: "ভুল", cls: "text-rose-300 bg-state-danger/10 ring-state-danger/30" },
  skipped: { icon: MinusCircle, label: "উত্তর দেওয়া হয়নি", cls: "text-slate-300 bg-white/5 ring-white/10" },
};

function ExplanationCard({ q, number }: { q: QuestionResult; number: number }) {
  const meta = STATUS_META[q.status];
  const Icon = meta.icon;
  return (
    <li className="rounded-3xl border border-surface-border bg-obsidian-800/60 p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span lang="bn" className="font-display text-sm font-bold text-ink-muted">
          প্রশ্ন {toBn(number)}
        </span>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ring-1", meta.cls)}>
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
                isCorrect && "border-brand-400/60 bg-brand-400/10 text-ink",
                isWrongPick && "border-state-danger/60 bg-state-danger/10 text-ink",
                !isCorrect && !isWrongPick && "border-surface-border text-ink-muted",
              )}
            >
              <span lang="bn" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 text-xs font-bold">
                {OPTION_LABEL_BN[o.id]}
              </span>
              <span lang="bn" className="flex-1">
                {o.text}
              </span>
              {isCorrect && <CheckCircle2 className="h-4 w-4 text-brand-400" aria-label="Correct answer" />}
              {isWrongPick && <XCircle className="h-4 w-4 text-rose-400" aria-label="Your answer" />}
            </li>
          );
        })}
      </ul>
      <div className="flex gap-3 rounded-2xl bg-leaf-400/[0.07] p-4 ring-1 ring-leaf-400/20">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-leaf-300" strokeWidth={1.5} />
        <p lang="bn" className="text-sm leading-relaxed text-ink/85">
          {q.explanation}
        </p>
      </div>
    </li>
  );
}
