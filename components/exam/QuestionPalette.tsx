"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn, toBn } from "@/lib/utils";
import type { Answers, CandidateQuestion } from "@/lib/types";

export type PaletteStatus = "answered" | "flagged" | "unanswered";

interface QuestionPaletteProps {
  questions: CandidateQuestion[];
  answers: Answers;
  flags: Record<string, boolean>;
  current: number;
  onJump: (index: number) => void;
  onSubmit: () => void;
  className?: string;
}

export function paletteStatus(id: string, answers: Answers, flags: Record<string, boolean>): PaletteStatus {
  if (flags[id]) return "flagged";
  return answers[id] ? "answered" : "unanswered";
}

const STATUS_STYLE: Record<PaletteStatus, string> = {
  answered: "border-brand-400/60 bg-brand-400/15 text-brand-200",
  flagged: "border-state-flagged/60 bg-state-flagged/15 text-amber-200",
  unanswered: "border-white/10 bg-white/[0.02] text-ink-muted hover:border-white/25 hover:text-ink",
};

const LEGEND: { status: PaletteStatus; label: string; dot: string }[] = [
  { status: "answered", label: "উত্তর দেওয়া", dot: "bg-state-answered" },
  { status: "flagged", label: "চিহ্নিত", dot: "bg-state-flagged" },
  { status: "unanswered", label: "বাকি", dot: "bg-state-unanswered" },
];

/** Question navigator: sticky sidebar on desktop, bottom sheet content on mobile. */
export function QuestionPalette({ questions, answers, flags, current, onJump, onSubmit, className }: QuestionPaletteProps) {
  const counts = questions.reduce<Record<PaletteStatus, number>>(
    (acc, q) => {
      acc[paletteStatus(q.id, answers, flags)] += 1;
      return acc;
    },
    { answered: 0, flagged: 0, unanswered: 0 },
  );
  const answeredTotal = questions.filter((q) => answers[q.id]).length;

  return (
    <nav aria-label="Question navigator" className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-baseline justify-between">
        <h3 lang="bn" className="text-sm font-semibold text-ink">
          প্রশ্ন তালিকা
        </h3>
        <span className="font-display text-xs text-ink-muted">
          <span lang="bn" className="text-brand-300">
            {toBn(answeredTotal)}
          </span>
          <span lang="bn">/{toBn(questions.length)}</span>
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-2">
        {LEGEND.map((l) => (
          <li key={l.status} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-2 text-center">
            <span className="mb-1 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
              <span className={cn("h-2 w-2 rounded-full", l.dot)} />
              <span lang="bn">{l.label}</span>
            </span>
            <span lang="bn" className="font-display text-lg font-bold text-ink">
              {toBn(counts[l.status])}
            </span>
          </li>
        ))}
      </ul>

      <ol className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {questions.map((q, i) => {
          const status = paletteStatus(q.id, answers, flags);
          const isCurrent = i === current;
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${i + 1}, ${status}`}
                className={cn(
                  "relative flex aspect-square w-full items-center justify-center rounded-xl border font-bangla text-sm font-semibold transition-all duration-200",
                  STATUS_STYLE[status],
                  isCurrent && "scale-105",
                )}
              >
                {isCurrent && (
                  <motion.span
                    layoutId="palette-current"
                    className="absolute -inset-[3px] rounded-[14px] border-2 border-cyanlight-300 shadow-[0_0_16px_-2px_rgba(103,232,249,0.7)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span lang="bn" className="relative">
                  {toBn(i + 1)}
                </span>
                {status === "flagged" && answers[q.id] && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <button type="button" onClick={onSubmit} className="btn-primary w-full">
        <Send className="h-4 w-4" strokeWidth={1.5} />
        <span lang="bn">পরীক্ষা জমা দাও</span>
      </button>
    </nav>
  );
}
