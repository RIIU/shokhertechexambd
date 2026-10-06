"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Send, SkipForward } from "lucide-react";
import { AntiCheatWrapper } from "@/components/security/AntiCheatWrapper";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ExamRulesGate } from "@/components/exam/ExamRulesGate";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { OptionSelector } from "@/components/exam/OptionSelector";
import { SubmitDialog } from "@/components/exam/SubmitDialog";
import { StrikeMeter, toLocalClock, type AttemptInfo, type Candidate } from "./shared";
import { cn, toBn } from "@/lib/utils";
import type { CandidateExam, CandidateQuestion, OptionId, SubmitReason } from "@/lib/types";

interface StrictQuestion {
  index: number;
  total: number;
  question: CandidateQuestion;
}

type QuestionResponse = ({ done: false } & StrictQuestion) | { done: true; reason?: "time-up" };

interface StrictExamClientProps {
  /** Exam details without questions: those are fetched one at a time after starting. */
  exam: CandidateExam;
  questionCount: number;
  candidate: Candidate;
  initialAttempt: AttemptInfo | null;
}

/** Keys 1–4 pick the option in that position (options are shuffled per student). */
const POSITION_KEYS: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3 };

const ERROR_COPY: Record<string, string> = {
  "other-device": "এই পরীক্ষা অন্য একটি ডিভাইস বা ব্রাউজারে শুরু হয়েছে। যেখানে শুরু করেছিলে, সেখান থেকেই চালিয়ে যাও।",
  network: "সংযোগে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করো।",
};

/**
 * Live and model tests: one question at a time from the server. Answering or
 * skipping moves on for good; there is no way back and no question list.
 */
export function StrictExamClient({ exam, questionCount, candidate, initialAttempt }: StrictExamClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptInfo | null>(() => (initialAttempt ? toLocalClock(initialAttempt) : null));
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [current, setCurrent] = useState<StrictQuestion | null>(null);
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const strikesRef = useRef(initialAttempt?.strikes ?? 0);
  const currentRef = useRef<StrictQuestion | null>(null);
  currentRef.current = current;

  /* ------------------------------- Submit -------------------------------- */
  const submit = useCallback(
    async (reason: SubmitReason, strikesOverride?: number) => {
      if (submittingRef.current || !attempt) return;
      submittingRef.current = true;
      setSubmitting(true);
      setError(null);
      // Answers are already on the server; this only closes the attempt.
      const body = JSON.stringify({
        answers: {},
        reason,
        strikes: strikesOverride ?? strikesRef.current,
        timeTakenSec: (Date.now() - attempt.startedAt) / 1000,
      });
      const tries = reason === "manual" ? 1 : 3;
      for (let i = 0; i < tries; i++) {
        try {
          const res = await fetch(`/api/attempts/${attempt.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
          if (!res.ok && res.status !== 409) throw new Error(`HTTP ${res.status}`);
          setRunning(false);
          router.replace(`/results/${attempt.id}`);
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        }
      }
      submittingRef.current = false;
      setSubmitting(false);
      setError("জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।");
    },
    [attempt, router],
  );

  /** Shows the next question, or closes the attempt when there is none. */
  const show = useCallback(
    (res: QuestionResponse) => {
      if (res.done) {
        setCurrent(null);
        void submit(res.reason === "time-up" ? "time-up" : "manual");
        return;
      }
      setCurrent({ index: res.index, total: res.total, question: res.question });
      setAnswered(res.index);
      setSelected(null);
      window.scrollTo({ top: 0 });
    },
    [submit],
  );

  const loadQuestion = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/attempts/${id}/question`, { cache: "no-store" });
      const body = (await res.json()) as QuestionResponse & { error?: string };
      if (res.status === 409) {
        router.replace(`/results/${id}`);
        return false;
      }
      if (!res.ok) throw new Error(body.error ?? "network");
      show(body);
      return true;
    },
    [router, show],
  );

  /* ------------------------------- Start --------------------------------- */
  const begin = useCallback(async () => {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
    }
    setStarting(true);
    setStartError(null);
    try {
      let a = attempt;
      const res = await fetch(`/api/exams/${exam.id}/start`, { method: "POST" });
      const body = (await res.json()) as { attempt?: AttemptInfo; error?: string; attemptId?: string };
      if (res.status === 409 && body.attemptId) {
        router.replace(`/results/${body.attemptId}`);
        return;
      }
      if (!res.ok || !body.attempt) throw new Error(body.error ?? "network");
      a = toLocalClock(body.attempt);
      setAttempt(a);
      strikesRef.current = Math.max(strikesRef.current, a.strikes);
      if (await loadQuestion(a.id)) setRunning(true);
    } catch (e) {
      const code = e instanceof Error ? e.message : "network";
      setStartError(ERROR_COPY[code] ?? ERROR_COPY.network!);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    } finally {
      setStarting(false);
    }
  }, [attempt, exam.id, loadQuestion, router]);

  /* ------------------------------- Answer -------------------------------- */
  const send = useCallback(
    async (optionId: OptionId | null) => {
      const q = currentRef.current;
      if (!q || !attempt || sending) return;
      setSending(true);
      setError(null);
      try {
        const res = await fetch(`/api/attempts/${attempt.id}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: q.question.id, optionId }),
        });
        const body = (await res.json()) as QuestionResponse & { error?: string };
        if (res.status === 410) {
          void submit("time-up");
          return;
        }
        // Out of step (e.g. answered from a stale screen): reload the real current question.
        if (res.status === 409 && body.error !== "already-submitted") {
          await loadQuestion(attempt.id);
          return;
        }
        if (!res.ok) throw new Error(body.error ?? "network");
        show(body);
      } catch (e) {
        const code = e instanceof Error ? e.message : "network";
        setError(ERROR_COPY[code] ?? ERROR_COPY.network!);
      } finally {
        setSending(false);
      }
    },
    [attempt, loadQuestion, sending, show, submit],
  );

  /* -------------------------- Keyboard shortcuts ------------------------- */
  useEffect(() => {
    if (!running || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || confirmOpen) return;
      const position = POSITION_KEYS[e.key];
      const opt = position === undefined ? undefined : current.question.options[position];
      if (opt) setSelected(opt.id);
      else if (e.key === "Enter" && selected) void send(selected);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, current, selected, confirmOpen, send]);

  /* ------------------------------- Render -------------------------------- */
  if (!running || !attempt) {
    return (
      <ExamRulesGate
        exam={exam}
        strict
        questionCount={questionCount}
        resuming={Boolean(attempt)}
        starting={starting}
        error={startError}
        onStart={() => void begin()}
      />
    );
  }

  const total = current?.total ?? questionCount;
  const isLast = current ? current.index === total - 1 : false;

  return (
    <AntiCheatWrapper
      active={running && !submitting}
      maxWarnings={exam.maxWarnings}
      initialStrikes={strikesRef.current}
      watermarkLines={[`${candidate.name} · ${candidate.phone}`, `IP ${candidate.ip} · ${candidate.roll}`]}
      reportEndpoint={`/api/exams/${exam.id}/violations?attempt=${attempt.id}`}
      context={() => (currentRef.current ? `Q${currentRef.current.index + 1}` : undefined)}
      onViolation={(event, strikes) => {
        if (event.strike) strikesRef.current = strikes;
      }}
      onMaxWarnings={() => void submit("max-warnings", exam.maxWarnings)}
      className="min-h-screen pb-10"
    >
      <div className="page-backdrop" />
      <ExamProgressBar answered={answered} total={total} />

      <header className="sticky top-1 z-40 px-3 pt-2 sm:px-6">
        <div className="glass mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:px-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-danger opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-state-danger" />
              </span>
              {exam.type === "live" ? "Live" : "Model test"}
            </p>
            <h1 lang="bn" className="truncate text-sm font-semibold text-ink sm:text-base">
              {exam.titleBn}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <StrikeMeter />
            <ExamTimer endsAt={attempt.endsAt} durationSec={exam.durationSec} onExpire={() => void submit("time-up")} compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 pt-6 sm:px-6">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.article
              key={current.question.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="strict-q-title"
              className="rounded-3xl border border-surface-border bg-obsidian-800/70 p-5 shadow-card backdrop-blur sm:p-8"
            >
              <header className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-brand-400/15 px-2.5 py-1 font-display text-xs font-bold text-brand-300 ring-1 ring-brand-400/30">
                  <span lang="bn">
                    প্রশ্ন {toBn(current.index + 1)} / {toBn(total)}
                  </span>
                </span>
                <span lang="bn" className="chip">
                  {current.question.topic}
                </span>
                <span lang="bn" className="chip">
                  মান {toBn(current.question.marks)}
                </span>
              </header>

              <h2 id="strict-q-title" lang="bn" className="mb-6 text-lg font-semibold leading-relaxed text-ink sm:text-xl">
                {current.question.text}
              </h2>

              <OptionSelector
                name={current.question.id}
                options={current.question.options}
                selected={selected}
                onSelect={setSelected}
                labelledBy="strict-q-title"
                labelByPosition
              />

              <p lang="bn" className="mt-6 flex items-center gap-2 text-xs text-ink-subtle">
                <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                পরের প্রশ্নে গেলে এই প্রশ্নে আর ফেরা যাবে না।
              </p>

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => void send(null)} disabled={sending} className="btn-ghost">
                  <SkipForward className="h-4 w-4" strokeWidth={1.75} />
                  <span lang="bn">উত্তর না দিয়ে এগোও</span>
                </button>
                <button
                  type="button"
                  onClick={() => selected && void send(selected)}
                  disabled={!selected || sending}
                  className={cn("btn-primary px-6 py-3", !selected && "opacity-50")}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : isLast ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  <span lang="bn">{isLast ? "উত্তর দাও ও জমা দাও" : "উত্তর দাও ও পরের প্রশ্ন"}</span>
                </button>
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

        <div className="mt-6 flex items-center justify-between text-xs text-ink-subtle">
          <span lang="bn">
            {toBn(answered)}টি শেষ · {toBn(Math.max(0, total - answered))}টি বাকি
          </span>
          <button type="button" onClick={() => setConfirmOpen(true)} className="underline-offset-4 hover:text-ink-muted hover:underline">
            <span lang="bn">এখনই পরীক্ষা শেষ করো</span>
          </button>
        </div>
      </main>

      <SubmitDialog
        open={confirmOpen}
        answered={answered}
        flagged={0}
        total={total}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void submit("manual")}
      />
    </AntiCheatWrapper>
  );
}
