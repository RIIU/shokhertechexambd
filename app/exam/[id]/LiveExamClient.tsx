"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Flag, LayoutGrid, LayoutList, Loader2, Send, ShieldCheck, X } from "lucide-react";
import { AntiCheatWrapper, useAntiCheat } from "@/components/security/AntiCheatWrapper";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ExamRulesGate } from "@/components/exam/ExamRulesGate";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { OptionSelector, QuestionCard } from "@/components/exam/QuestionCard";
import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { SubmitDialog } from "@/components/exam/SubmitDialog";
import { clearExamSession, useExamSession } from "@/lib/hooks/useExamSession";
import { cn, toBn } from "@/lib/utils";
import type { CandidateExam, OptionId, SubmitPayload, SubmitReason } from "@/lib/types";

export interface Candidate {
  name: string;
  phone: string;
  roll: string;
  ip: string;
}

/** The server-side attempt: its deadline is the only one that counts. */
export interface AttemptInfo {
  id: string;
  startedAt: number;
  endsAt: number;
  strikes: number;
  /** Server clock when this was sent; used to correct a wrong device clock. */
  serverNow: number;
}

/** Shift server timestamps onto the device clock so the countdown is right even if the phone's clock is off. */
export function toLocalClock(a: AttemptInfo): AttemptInfo {
  const skew = a.serverNow - Date.now();
  return { ...a, startedAt: a.startedAt - skew, endsAt: a.endsAt - skew, serverNow: Date.now() };
}

interface LiveExamClientProps {
  exam: CandidateExam;
  candidate: Candidate;
  /** An attempt already in progress (resumed after a refresh), if any. */
  initialAttempt: AttemptInfo | null;
}

const OPTION_KEYS: Record<string, OptionId> = { "1": "a", "2": "b", "3": "c", "4": "d" };

export function LiveExamClient({ exam, candidate, initialAttempt }: LiveExamClientProps) {
  const router = useRouter();
  const total = exam.questions.length;
  const [attempt, setAttempt] = useState<AttemptInfo | null>(() => (initialAttempt ? toLocalClock(initialAttempt) : null));
  const { state, select, toggleFlag, goTo, setStrikes } = useExamSession(attempt?.id ?? null, total);

  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const submittingRef = useRef(false);

  const question = exam.questions[state.current];
  const answeredCount = useMemo(() => exam.questions.filter((q) => state.answers[q.id]).length, [exam.questions, state.answers]);
  const flaggedCount = useMemo(() => exam.questions.filter((q) => state.flags[q.id]).length, [exam.questions, state.flags]);

  /* ------------------------------- Start --------------------------------- */
  const begin = useCallback(async () => {
    // Fullscreen must be requested synchronously inside the click handler.
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
    }
    if (attempt) {
      setRunning(true);
      return;
    }
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch(`/api/exams/${exam.id}/start`, { method: "POST" });
      const body = (await res.json()) as { attempt?: AttemptInfo; error?: string; attemptId?: string };
      if (res.status === 409 && body.attemptId) {
        router.replace(`/results/${body.attemptId}`);
        return;
      }
      if (!res.ok || !body.attempt) throw new Error(body.error ?? `HTTP ${res.status}`);
      setAttempt(toLocalClock(body.attempt));
      setRunning(true);
    } catch {
      setStartError("পরীক্ষা শুরু করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।");
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    } finally {
      setStarting(false);
    }
  }, [attempt, exam.id, router]);

  /* ------------------------------- Submit -------------------------------- */
  const submit = useCallback(
    async (reason: SubmitReason, strikesOverride?: number) => {
      if (submittingRef.current || !attempt) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError(null);

      // The server recomputes time taken and strikes; these are hints.
      const payload: SubmitPayload = {
        answers: state.answers,
        reason,
        strikes: strikesOverride ?? Math.max(state.strikes, attempt.strikes),
        timeTakenSec: (Date.now() - attempt.startedAt) / 1000,
      };

      // Forced submissions (time up / max warnings) retry; the student can't do it themselves.
      const tries = reason === "manual" ? 1 : 3;
      for (let i = 0; i < tries; i++) {
        try {
          const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          // 409 = already submitted (e.g. from another tab): the result exists either way.
          if (!res.ok && res.status !== 409) throw new Error(`HTTP ${res.status}`);
          clearExamSession(attempt.id);
          setRunning(false);
          router.replace(`/results/${attempt.id}`);
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        }
      }

      submittingRef.current = false;
      setSubmitting(false);
      setSubmitError("জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।");
    },
    [attempt, router, state.answers, state.strikes],
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
      <ExamRulesGate exam={exam} resuming={Boolean(attempt)} starting={starting} error={startError} onStart={() => void begin()} />
    );
  }

  if (!question || !attempt) return null;

  const isLast = state.current === total - 1;

  return (
    <AntiCheatWrapper
      active={running && !submitting}
      maxWarnings={exam.maxWarnings}
      initialStrikes={Math.max(state.strikes, attempt.strikes)}
      watermarkLines={[`${candidate.name} · ${candidate.phone}`, `IP ${candidate.ip} · ${candidate.roll}`]}
      reportEndpoint={`/api/exams/${exam.id}/violations?attempt=${attempt.id}`}
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
            <ExamTimer endsAt={attempt.endsAt} durationSec={exam.durationSec} onExpire={() => void submit("time-up")} compact />
          </div>
        </div>
      </header>

      {/* ----------------------------- Body ----------------------------- */}
      <main className="mx-auto grid max-w-7xl gap-6 px-3 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-live="polite">
          {/* View mode toggle & quick summary */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-obsidian-900/80 p-2 sm:p-2.5 backdrop-blur">
            <div className="inline-flex rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "all" ? "bg-brand-400 text-forest shadow" : "text-ink-muted hover:text-ink"
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span lang="bn">সব প্রশ্ন একসাথে ({toBn(total)})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "single" ? "bg-brand-400 text-forest shadow" : "text-ink-muted hover:text-ink"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                <span lang="bn">একটি করে প্রশ্ন</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span lang="bn" className="text-xs font-medium text-ink-muted">
                উত্তর: <strong className="text-brand-300 font-bold">{toBn(answeredCount)}</strong> / {toBn(total)}
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span lang="bn">জমা দাও</span>
              </button>
            </div>
          </div>

          {viewMode === "all" ? (
            <div className="space-y-6">
              {exam.questions.map((q, idx) => {
                const isAnswered = Boolean(state.answers[q.id]);
                const isFlagged = Boolean(state.flags[q.id]);
                return (
                  <article
                    key={q.id}
                    id={`q-card-${q.id}`}
                    aria-labelledby={`q-${q.id}-title`}
                    className={cn(
                      "relative overflow-hidden rounded-3xl border p-5 shadow-card backdrop-blur sm:p-7 transition-all duration-200",
                      isAnswered
                        ? "border-brand-400/40 bg-obsidian-800/80"
                        : isFlagged
                        ? "border-amber-400/40 bg-obsidian-800/70"
                        : "border-surface-border bg-obsidian-800/60"
                    )}
                  >
                    <header className="relative mb-5 flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-lg px-2.5 py-1 font-display text-xs font-bold ring-1",
                            isAnswered
                              ? "bg-brand-400/20 text-brand-300 ring-brand-400/30"
                              : "bg-white/5 text-ink-muted ring-white/10"
                          )}
                        >
                          <span lang="bn">প্রশ্ন {toBn(idx + 1)}</span>
                          <span className="mx-1 text-ink-subtle">/</span>
                          <span lang="bn">{toBn(total)}</span>
                        </span>
                        <span lang="bn" className="chip">
                          {q.topic}
                        </span>
                        <span lang="bn" className="chip">
                          মান {toBn(q.marks)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFlag(q.id)}
                        aria-pressed={isFlagged}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                          isFlagged
                            ? "border-state-flagged/50 bg-state-flagged/15 text-amber-300 shadow-[0_0_20px_-6px_rgba(245,158,11,0.6)]"
                            : "border-white/10 text-ink-muted hover:border-state-flagged/40 hover:text-amber-200"
                        )}
                      >
                        <Flag className={cn("h-3.5 w-3.5", isFlagged && "fill-current")} strokeWidth={1.5} />
                        <span lang="bn">{isFlagged ? "চিহ্নিত" : "পরে দেখব"}</span>
                      </button>
                    </header>

                    <h2
                      id={`q-${q.id}-title`}
                      lang="bn"
                      className="relative mb-5 text-base font-semibold leading-relaxed text-ink sm:text-lg"
                    >
                      {q.text}
                    </h2>

                    <OptionSelector
                      name={q.id}
                      options={q.options}
                      selected={state.answers[q.id] ?? null}
                      onSelect={(opt) => select(q.id, opt)}
                      labelledBy={`q-${q.id}-title`}
                    />

                    {isAnswered && (
                      <button
                        type="button"
                        onClick={() => select(q.id, null)}
                        className="relative mt-3 text-xs text-ink-subtle underline-offset-4 transition-colors hover:text-ink-muted hover:underline"
                      >
                        <span lang="bn">উত্তর মুছে ফেলো</span>
                      </button>
                    )}
                  </article>
                );
              })}

              <div className="rounded-3xl border border-surface-border bg-gradient-to-br from-obsidian-800 to-obsidian-900 p-6 text-center sm:p-8">
                <h3 lang="bn" className="mb-2 text-xl font-bold text-ink">
                  সব প্রশ্ন উত্তর করা হয়েছে?
                </h3>
                <p lang="bn" className="mb-6 text-sm text-ink-muted">
                  মোট {toBn(total)}টি প্রশ্নের মধ্যে {toBn(answeredCount)}টির উত্তর দিয়েছ।{" "}
                  {total - answeredCount > 0 ? `${toBn(total - answeredCount)}টি এখনো বাকি আছে।` : "সবগুলোর উত্তর সম্পন্ন!"}
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="btn-primary mx-auto py-3 px-8 text-base shadow-glow"
                >
                  <Send className="h-4 w-4" />
                  <span lang="bn">পরীক্ষা জমা দাও</span>
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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
              onJump={(i) => {
                goTo(i);
                const q = exam.questions[i];
                if (viewMode === "all" && q) {
                  document.getElementById(`q-card-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              onSubmit={() => setConfirmOpen(true)}
            />
          </div>
        </aside>
      </main>

      {/* ----------------------- Mobile bottom bar ----------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
        <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-card">
          {viewMode === "single" && (
            <button
              type="button"
              onClick={() => goTo(state.current - 1)}
              disabled={state.current === 0}
              aria-label="Previous question"
              className="btn-ghost px-3 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          <button type="button" onClick={() => setPaletteOpen(true)} className="btn-ghost flex-1">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">
              {toBn(answeredCount)}/{toBn(total)} উত্তর
            </span>
          </button>
          {viewMode === "all" ? (
            <button type="button" onClick={() => setConfirmOpen(true)} className="btn-primary px-4">
              <Send className="h-4 w-4 mr-1" />
              <span lang="bn">জমা দাও</span>
            </button>
          ) : isLast ? (
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
                  const q = exam.questions[i];
                  if (viewMode === "all" && q) {
                    document.getElementById(`q-card-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
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
export function StrikeMeter() {
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
