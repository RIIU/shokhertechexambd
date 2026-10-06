"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, Lightbulb, Loader2, LogOut, Play, SkipForward, XCircle } from "lucide-react";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { toLocalClock, type AttemptInfo } from "./shared";
import { cn, formatMinutesBn, OPTION_LABEL_BN, toBn } from "@/lib/utils";
import type { CandidateExam, CandidateQuestion, OptionId } from "@/lib/types";

interface Current {
  index: number;
  total: number;
  question: CandidateQuestion;
}

interface Feedback {
  correct: boolean;
  correctOptionId?: OptionId;
  explanation?: string;
}

type Step = ({ done: false } & Current) | { done: true; reason?: "time-up" };

interface PracticeClientProps {
  exam: CandidateExam;
  questionCount: number;
  subjectBn?: string;
  initialAttempt: AttemptInfo | null;
}

const POSITION_KEYS: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };

/**
 * Practice sets: relaxed (no fullscreen or warnings), one question at a time,
 * and every answer is checked straight away with the explanation.
 */
export function PracticeClient({ exam, questionCount, subjectBn, initialAttempt }: PracticeClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptInfo | null>(() => (initialAttempt ? toLocalClock(initialAttempt) : null));
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState<Current | null>(null);
  const [picked, setPicked] = useState<OptionId | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [queued, setQueued] = useState<Step | null>(null);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, streak: 0 });
  const [finishing, setFinishing] = useState(false);
  const finishingRef = useRef(false);

  const finish = useCallback(
    async (reason: "manual" | "time-up" = "manual") => {
      if (!attempt || finishingRef.current) return;
      finishingRef.current = true;
      setFinishing(true);
      try {
        const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: {}, reason, strikes: 0, timeTakenSec: (Date.now() - attempt.startedAt) / 1000 }),
        });
        if (!res.ok && res.status !== 409) throw new Error();
        router.replace(`/results/${attempt.id}`);
      } catch {
        finishingRef.current = false;
        setFinishing(false);
        setError("জমা দেওয়া যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।");
      }
    },
    [attempt, router],
  );

  const show = useCallback((step: Step) => {
    setPicked(null);
    setFeedback(null);
    setQueued(null);
    if (step.done) {
      setCurrent(null);
      return;
    }
    setCurrent({ index: step.index, total: step.total, question: step.question });
    window.scrollTo({ top: 0 });
  }, []);

  /* ------------------------------- Start --------------------------------- */
  const begin = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/exams/${exam.id}/start`, { method: "POST" });
      const body = (await res.json()) as { attempt?: AttemptInfo };
      if (!res.ok || !body.attempt) throw new Error();
      const a = toLocalClock(body.attempt);
      setAttempt(a);
      const q = await fetch(`/api/attempts/${a.id}/question`, { cache: "no-store" });
      if (q.status === 409) {
        router.replace(`/results/${a.id}`);
        return;
      }
      const step = (await q.json()) as Step;
      if (!q.ok) throw new Error();
      setRunning(true);
      show(step);
    } catch {
      setError("শুরু করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।");
    } finally {
      setStarting(false);
    }
  }, [exam.id, router, show]);

  // All questions done: close the attempt and open the result.
  useEffect(() => {
    if (running && !current && !finishingRef.current && attempt) void finish();
  }, [running, current, attempt, finish]);

  /* ------------------------------- Answer -------------------------------- */
  const answer = useCallback(
    async (optionId: OptionId | null) => {
      if (!attempt || !current || sending || feedback) return;
      setSending(true);
      setPicked(optionId);
      try {
        const res = await fetch(`/api/attempts/${attempt.id}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: current.question.id, optionId }),
        });
        const body = (await res.json()) as Step & { feedback?: Feedback; error?: string };
        if (res.status === 410) return void finish("time-up");
        if (!res.ok) throw new Error(body.error);
        const { feedback: fb, ...next } = body;
        if (optionId === null) {
          show(next as Step);
          return;
        }
        setFeedback(fb ?? { correct: false });
        setQueued(next as Step);
        setStats((s) =>
          fb?.correct ? { correct: s.correct + 1, wrong: s.wrong, streak: s.streak + 1 } : { correct: s.correct, wrong: s.wrong + 1, streak: 0 },
        );
      } catch {
        setPicked(null);
        setError("উত্তর পাঠানো যায়নি। আবার চেষ্টা করো।");
      } finally {
        setSending(false);
      }
    },
    [attempt, current, feedback, finish, sending, show],
  );

  const next = useCallback(() => queued && show(queued), [queued, show]);

  useEffect(() => {
    if (!running || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const i = POSITION_KEYS[e.key];
      const opt = i === undefined ? undefined : current.question.options[i];
      if (opt && !feedback) void answer(opt.id);
      else if (e.key === "Enter" && feedback) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, current, feedback, answer, next]);

  /* ------------------------------- Render -------------------------------- */
  if (!running) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="page-backdrop" />
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-4xl border border-surface-border bg-obsidian-800/80 p-6 text-center shadow-card sm:p-10"
        >
          <p lang="bn" className="mb-2 text-sm font-semibold text-brand-300">
            {subjectBn ? `${subjectBn} · ` : ""}প্র্যাকটিস
          </p>
          <h1 lang="bn" className="mb-6 text-2xl font-bold text-ink sm:text-3xl">
            {exam.titleBn}
          </h1>
          <dl className="mb-8 grid grid-cols-3 gap-3">
            {[
              { k: "প্রশ্ন", v: toBn(questionCount) },
              { k: "সময়", v: formatMinutesBn(exam.durationSec) },
              { k: "নেগেটিভ", v: exam.negativeMark ? toBn(exam.negativeMark) : "নেই" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-surface-border bg-obsidian-900/60 p-3">
                <dt lang="bn" className="text-xs text-ink-muted">
                  {s.k}
                </dt>
                <dd lang="bn" className="font-display text-lg font-bold text-ink">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
          <ul lang="bn" className="mb-8 space-y-2 text-left text-sm text-ink-muted">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> উত্তর দিলেই জানবে সঠিক না ভুল, সাথে ব্যাখ্যা।
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> চাপ নেই: ফুলস্ক্রিন বা সতর্কতা লাগবে না।
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> শেষে পুরো ফলাফল আর দুর্বল টপিক দেখতে পাবে।
            </li>
          </ul>
          {error && (
            <p lang="bn" role="alert" className="mb-4 rounded-xl bg-state-danger/10 p-3 text-sm text-rose-200 ring-1 ring-state-danger/30">
              {error}
            </p>
          )}
          <button type="button" onClick={() => void begin()} disabled={starting} className="btn-primary w-full py-3.5 text-base">
            {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" strokeWidth={1.5} />}
            <span lang="bn">{attempt ? "যেখানে ছিলে সেখান থেকে চালিয়ে যাও" : "প্র্যাকটিস শুরু করো"}</span>
          </button>
        </motion.section>
      </main>
    );
  }

  const total = current?.total ?? questionCount;
  const done = current ? current.index + (feedback ? 1 : 0) : total;

  return (
    <main className="relative min-h-screen pb-16">
      <div className="page-backdrop" />
      <ExamProgressBar answered={done} total={total} />

      <header className="sticky top-1 z-40 px-3 pt-2 sm:px-6">
        <div className="glass mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:px-5">
          <div className="min-w-0">
            <p lang="bn" className="text-[11px] font-semibold text-brand-400">
              {subjectBn ?? "প্র্যাকটিস"}
            </p>
            <h1 lang="bn" className="truncate text-sm font-semibold text-ink sm:text-base">
              {exam.titleBn}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span lang="bn" className="hidden items-center gap-1 rounded-xl bg-brand-400/10 px-2.5 py-1.5 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/20 sm:inline-flex">
              <CheckCircle2 className="h-3.5 w-3.5" /> {toBn(stats.correct)}
            </span>
            <span lang="bn" className="hidden items-center gap-1 rounded-xl bg-state-danger/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 ring-1 ring-state-danger/20 sm:inline-flex">
              <XCircle className="h-3.5 w-3.5" /> {toBn(stats.wrong)}
            </span>
            {stats.streak >= 3 && (
              <span lang="bn" className="inline-flex items-center gap-1 rounded-xl bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/25">
                <Flame className="h-3.5 w-3.5" /> {toBn(stats.streak)}
              </span>
            )}
            <button type="button" onClick={() => void finish()} disabled={finishing} className="btn-ghost px-3 py-1.5 text-xs">
              {finishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              <span lang="bn">শেষ করো</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-3 pt-6 sm:px-6">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.article
              key={current.question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-surface-border bg-obsidian-800/70 p-5 shadow-card backdrop-blur sm:p-8"
            >
              <header className="mb-5 flex flex-wrap items-center gap-2">
                <span lang="bn" className="inline-flex rounded-lg bg-brand-400/15 px-2.5 py-1 font-display text-xs font-bold text-brand-300 ring-1 ring-brand-400/30">
                  প্রশ্ন {toBn(current.index + 1)} / {toBn(total)}
                </span>
                <span lang="bn" className="chip">
                  {current.question.topic}
                </span>
              </header>
              <h2 id="practice-q-title" lang="bn" className="mb-6 text-lg font-semibold leading-relaxed text-ink sm:text-xl">
                {current.question.text}
              </h2>

              <ul className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="practice-q-title">
                {current.question.options.map((o, i) => {
                  const isPicked = picked === o.id;
                  const isCorrect = feedback?.correctOptionId === o.id || (feedback?.correct && isPicked);
                  const isWrong = feedback && isPicked && !feedback.correct;
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isPicked}
                        disabled={Boolean(feedback) || sending}
                        onClick={() => void answer(o.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-base transition-all",
                          !feedback && "border-surface-border bg-obsidian-900/50 hover:-translate-y-0.5 hover:border-brand-400/50",
                          isCorrect && "border-brand-400/70 bg-brand-400/10",
                          isWrong && "border-state-danger/70 bg-state-danger/10",
                          feedback && !isCorrect && !isWrong && "border-surface-border opacity-60",
                        )}
                      >
                        <span
                          lang="bn"
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1",
                            isCorrect ? "bg-brand-400 text-forest ring-brand-400" : isWrong ? "bg-state-danger text-white ring-state-danger" : "ring-white/15 text-ink-muted",
                          )}
                        >
                          {sending && isPicked ? <Loader2 className="h-4 w-4 animate-spin" /> : OPTION_LABEL_BN[o.id]}
                        </span>
                        <span lang="bn" className="flex-1 text-ink">
                          {o.text}
                        </span>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-400" />}
                        {isWrong && <XCircle className="h-5 w-5 text-rose-400" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
                    <p
                      lang="bn"
                      className={cn(
                        "flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold ring-1",
                        feedback.correct ? "bg-brand-400/10 text-brand-200 ring-brand-400/25" : "bg-state-danger/10 text-rose-200 ring-state-danger/25",
                      )}
                    >
                      {feedback.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {feedback.correct ? (stats.streak >= 3 ? `দারুণ! টানা ${toBn(stats.streak)}টি সঠিক` : "সঠিক উত্তর!") : "ভুল হয়েছে, ব্যাখ্যাটা দেখে নাও"}
                    </p>
                    {feedback.explanation && (
                      <div className="flex gap-3 rounded-2xl bg-leaf-400/[0.07] p-4 ring-1 ring-leaf-400/20">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-leaf-300" strokeWidth={1.5} />
                        <p lang="bn" className="text-sm leading-relaxed text-ink/85">
                          {feedback.explanation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between gap-3">
                {!feedback ? (
                  <button type="button" onClick={() => void answer(null)} disabled={sending} className="btn-ghost">
                    <SkipForward className="h-4 w-4" />
                    <span lang="bn">বাদ দাও</span>
                  </button>
                ) : (
                  <span />
                )}
                {feedback && (
                  <button type="button" onClick={next} className="btn-primary px-6 py-3" autoFocus>
                    <span lang="bn">{queued?.done ? "ফলাফল দেখো" : "পরের প্রশ্ন"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.article>
          ) : (
            <motion.div key="wait" className="flex justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p lang="bn" role="alert" className="mt-4 rounded-xl bg-state-danger/10 p-3 text-sm text-rose-200 ring-1 ring-state-danger/30">
            {error}
          </p>
        )}
        <p className="mt-6 text-center text-xs text-ink-subtle">
          <Link href="/practice" className="hover:text-ink-muted">
            <span lang="bn">← সব প্র্যাকটিস</span>
          </Link>
        </p>
      </section>
    </main>
  );
}
