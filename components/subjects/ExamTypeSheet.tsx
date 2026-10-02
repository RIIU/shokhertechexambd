"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ArrowRight, Lock, PenLine, Radio, Target, X, type LucideIcon } from "lucide-react";
import { SubjectIcon } from "./SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { EXAM_TYPES, EXAM_TYPE_META, LEVELS, STREAMS } from "@/lib/data/catalog";
import { cn, toBn } from "@/lib/utils";
import type { ExamType, Level, StreamId, Subject } from "@/lib/types";

const TYPE_ICON: Record<ExamType, LucideIcon> = {
  practice: PenLine,
  model: Target,
  live: Radio,
  archive: Archive,
};

interface ExamTypeSheetProps {
  subject: Subject | null;
  level: Level;
  stream: StreamId;
  onClose: () => void;
}

/** Side sheet (bottom sheet on mobile) listing the four exam types for a subject. */
export function ExamTypeSheet({ subject, level, stream, onClose }: ExamTypeSheetProps) {
  useEffect(() => {
    if (!subject) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [subject, onClose]);

  return (
    <AnimatePresence>
      {subject && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-end bg-obsidian-950/70 backdrop-blur-sm sm:items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-4xl border-l border-white/[0.06] bg-obsidian-800 p-6 scrollbar-thin sm:max-h-none sm:w-[440px] sm:rounded-none sm:rounded-l-4xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-radial-brand" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-xl p-2 text-ink-muted hover:bg-white/5 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <header className="relative mb-6">
              <span
                className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
                  ACCENT_STYLES[subject.accent].bg,
                  ACCENT_STYLES[subject.accent].text,
                  ACCENT_STYLES[subject.accent].ring,
                )}
              >
                <SubjectIcon icon={subject.icon} className="h-7 w-7" />
              </span>
              <p lang="bn" className="mb-1 text-xs text-ink-muted">
                {LEVELS[level].nameBn} · {STREAMS[stream].nameBn}
              </p>
              <h2 id="sheet-title" lang="bn" className="text-2xl font-bold text-ink">
                {subject.nameBn}
              </h2>
              <p className="text-sm text-ink-muted">{subject.nameEn}</p>
            </header>

            <ul className="relative space-y-3">
              {EXAM_TYPES.map((type, i) => {
                const Icon = TYPE_ICON[type];
                const meta = EXAM_TYPE_META[type];
                const examId = subject.featuredExamIds?.[type];
                const body = (
                  <>
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                        type === "live" ? "bg-state-danger/10 text-rose-300 ring-state-danger/30" : "bg-white/[0.04] text-brand-300 ring-white/10",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span lang="bn" className="block font-semibold text-ink">
                        {meta.nameBn}
                      </span>
                      <span lang="bn" className="block text-xs text-ink-muted">
                        {meta.descBn} · {toBn(subject.exams[type])}টি
                      </span>
                    </span>
                    {examId ? (
                      <ArrowRight className="h-5 w-5 shrink-0 text-brand-400 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-ink-subtle">
                        <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span lang="bn">শীঘ্রই</span>
                      </span>
                    )}
                  </>
                );

                return (
                  <motion.li
                    key={type}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    {examId ? (
                      <Link
                        href={`/exam/${examId}`}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border p-4 transition-all",
                          type === "live"
                            ? "border-state-danger/30 bg-state-danger/[0.04] hover:shadow-glow-danger"
                            : "border-white/[0.07] bg-white/[0.02] hover:border-brand-400/40 hover:shadow-glow-sm",
                        )}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div aria-disabled="true" className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 opacity-60">
                        {body}
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
