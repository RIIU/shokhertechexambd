"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, Loader2, ShieldCheck, X } from "lucide-react";
import { AntiCheatWrapper, useAntiCheat } from "@/components/security/AntiCheatWrapper";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ExamRulesGate } from "@/components/exam/ExamRulesGate";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { SubmitDialog } from "@/components/exam/SubmitDialog";
import { clearExamSession, resultStorageKey, useExamSession } from "@/lib/hooks/useExamSession";
import { cn, toBn } from "@/lib/utils";
import type { CandidateExam, ExamResult, OptionId, SubmitPayload, SubmitReason } from "@/lib/types";

export interface Candidate {
  name: string;
  phone: string;
  roll: string;
  ip: string;
}

interface LiveExamClientProps {
  exam: CandidateExam;
  candidate: Candidate;
}

const OPTION_KEYS: Record<string, OptionId> = { "1": "a", "2": "b", "3": "c", "4": "d" };

export function LiveExamClient({ exam, candidate }: LiveExamClientProps) {
  const router = useRouter();
  const total = exam.questions.length;
  const { state, start, select, toggleFlag, goTo, setStrikes } = useExamSession(exam.id, exam.durationSec, total);

  const [running, setRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const question = exam.questions[state.current];
  const answeredCount = useMemo(() => exam.questions.filter((q) => state.answers[q.id]).length, [exam.questions, state.answers]);
  const flaggedCount = useMemo(() => exam.questions.filter((q) => state.flags[q.id]).length, [exam.questions, state.flags]);

  /* ------------------------------- Submit -------------------------------- */
  const submit = useCallback(
    async (reason: SubmitReason, strikesOverride?: number) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError(null);

      const payload: SubmitPayload = {
        answers: state.answers,
        reason,
        strikes: strikesOverride ?? state.strikes,
        timeTakenSec: state.startedAt ? (Date.now() - state.startedAt) / 1000 : exam.durationSec,
      };

      // Forced submissions (time up / max warnings) retry; the student can't do it themselves.
      const attempts = reason === "manual" ? 1 : 3;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(`/api/exams/${exam.id}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const result = (await res.json()) as ExamResult;
          try {
            window.sessionStorage.setItem(resultStorageKey(exam.id), JSON.stringify(result));
          } catch {
            /* result page will show an empty state */
          }
          clearExamSession(exam.id);
          setRunning(false);
          router.replace(`/exam/${exam.id}/result`);
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        }
      }

      submittingRef.current = false;
      setSubmitting(false);
      setSubmitError("জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।");
    },
    [exam.durationSec, exam.id, router, state.answers, state.startedAt, state.strikes],
  );

  /* -------------------------- Keyboard shortcuts ------------------------- */
  const { current } = state;
  useEffect(() => {
    if (!running || !question) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || confirmOpen) return;
      const opt = OPTION_KEYS[e.key];
      if (opt) select(question.id, opt);
      else if (e.key === "ArrowRight") goTo(current + 1);
      else if (e.key === "ArrowLeft") goTo(current - 1);
      else if (e.key.toLowerCase() === "f") toggleFlag(question.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, question, current, confirmOpen, select, goTo, toggleFlag]);

  /* ------------------------------- Render -------------------------------- */
  if (!state.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!running) {
    return (
      <ExamRulesGate
        exam={exam}
        resuming={Boolean(state.startedAt)}
        onStart={() => {
          // Fullscreen must be requested synchronously inside the click handler.
          if (document.fullscreenEnabled && !document.fullscreenElement) {
            void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
          }
          start();
          setRunning(true);
        }}
      />
    );
  }

  if (!question || !state.endsAt) return null;

  const isLast = state.current === total - 1;

  return (
    <AntiCheatWrapper
      active={running && !submitting}
      maxWarnings={exam.maxWarnings}
      initialStrikes={state.strikes}
      watermarkLines={[`${candidate.name} · ${candidate.phone}`, `IP ${candidate.ip} · ${candidate.roll}`]}
      reportEndpoint={`/api/exams/${exam.id}/violations`}
      onViolation={(event, strikes) => {
        if (event.strike) setStrikes(strikes);
      }}
      // Fires inside the strike handler, before the strike count re-renders into state.
      onMaxWarnings={() => void submit("max-warnings", exam.maxWarnings)}
      className="min-h-screen pb-28 lg:pb-10"
    >
      <div className="page-backdrop" />
      <ExamProgressBar answered={answeredCount} total={total} />

      {/* ---------------------------- Header ---------------------------- */}
      <header className="sticky top-1 z-40 px-3 pt-2 sm:px-6">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="Home" className="hidden shrink-0 items-center gap-2 sm:flex" tabIndex={-1}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400 font-display text-sm font-black text-forest shadow-glow">
                ST
              </span>
            </Link>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-danger opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-state-danger" />
                </span>
                {exam.type === "live" ? "Live" : exam.type}
              </p>
              <h1 lang="bn" className="truncate text-sm font-semibold text-ink sm:text-base">
                {exam.titleBn}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <StrikeMeter />
            <ExamTimer endsAt={state.endsAt} durationSec={exam.durationSec} onExpire={() => void submit("time-up")} compact />
          </div>
        </div>
      </header>

      {/* ----------------------------- Body ----------------------------- */}
      <main className="mx-auto grid max-w-7xl gap-6 px-3 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-live="polite">
          <QuestionCard
            question={question}
            index={state.current}
            total={total}
            selected={state.answers[question.id] ?? null}
            flagged={Boolean(state.flags[question.id])}
            onSelect={(opt) => select(question.id, opt)}
            onToggleFlag={() => toggleFlag(question.id)}
            direction={state.direction}
          />

          {/* Desktop navigation */}
          <div className="mt-5 hidden items-center justify-between gap-3 lg:flex">
            <button type="button" onClick={() => goTo(state.current - 1)} disabled={state.current === 0} className="btn-ghost disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              <span lang="bn">আগের প্রশ্ন</span>
            </button>
            <p className="text-xs text-ink-subtle">
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">1–4</kbd> select ·{" "}
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">F</kbd> flag ·{" "}
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">↑ ↓</kbd> option ·{" "}
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono">← →</kbd> question
            </p>
            {isLast ? (
              <button type="button" onClick={() => setConfirmOpen(true)} className="btn-primary">
                <span lang="bn">শেষ করো ও জমা দাও</span>
              </button>
            ) : (
              <button type="button" onClick={() => goTo(state.current + 1)} className="btn-primary">
                <span lang="bn">পরের প্রশ্ন</span>
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {submitError && (
            <p lang="bn" role="alert" className="mt-4 rounded-xl bg-state-danger/10 p-3 text-sm text-rose-200 ring-1 ring-state-danger/30">
              {submitError}
            </p>
          )}
        </section>

        {/* Sticky palette (desktop) */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-24 rounded-3xl p-5 shadow-card">
            <QuestionPalette
              questions={exam.questions}
              answers={state.answers}
              flags={state.flags}
              current={state.current}
              onJump={goTo}
              onSubmit={() => setConfirmOpen(true)}
            />
          </div>
        </aside>
      </main>

      {/* ----------------------- Mobile bottom bar ----------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
        <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-card">
          <button
            type="button"
            onClick={() => goTo(state.current - 1)}
            disabled={state.current === 0}
            aria-label="Previous question"
            className="btn-ghost px-3 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => setPaletteOpen(true)} className="btn-ghost flex-1">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">
              {toBn(answeredCount)}/{toBn(total)} উত্তর
            </span>
          </button>
          {isLast ? (
            <button type="button" onClick={() => setConfirmOpen(true)} className="btn-primary px-4">
              <span lang="bn">জমা দাও</span>
            </button>
          ) : (
            <button type="button" onClick={() => goTo(state.current + 1)} aria-label="Next question" className="btn-primary px-3">
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile palette bottom sheet */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-obsidian-950/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Question navigator"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 120 && setPaletteOpen(false)}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-4xl border-t border-white/10 bg-obsidian-800 p-5 pb-8 scrollbar-thin"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
              <QuestionPalette
                questions={exam.questions}
                answers={state.answers}
                flags={state.flags}
                current={state.current}
                onJump={(i) => {
                  goTo(i);
                  setPaletteOpen(false);
                }}
                onSubmit={() => {
                  setPaletteOpen(false);
                  setConfirmOpen(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmitDialog
        open={confirmOpen}
        answered={answeredCount}
        flagged={flaggedCount}
        total={total}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void submit("manual")}
      />
    </AntiCheatWrapper>
  );
}

/** Compact shield + dots showing how many strikes have been used. */
function StrikeMeter() {
  const { strikes, maxWarnings } = useAntiCheat();
  const danger = strikes > 0;
  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-xl border px-2.5 py-2 sm:flex",
        danger ? "border-state-danger/40 bg-state-danger/10" : "border-brand-400/20 bg-brand-400/5",
      )}
      title={`Warnings ${strikes}/${maxWarnings}`}
    >
      <ShieldCheck className={cn("h-4 w-4", danger ? "text-state-danger" : "text-brand-400")} strokeWidth={1.5} />
      <div className="flex gap-1" aria-label={`Warnings ${strikes} of ${maxWarnings}`}>
        {Array.from({ length: maxWarnings }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-3 rounded-full", i < strikes ? "bg-state-danger" : "bg-white/15")} />
        ))}
      </div>
    </div>
  );
}
