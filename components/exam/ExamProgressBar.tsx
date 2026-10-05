"use client";

import { motion } from "framer-motion";

interface ExamProgressBarProps {
  answered: number;
  total: number;
}

/** Hairline progress bar pinned to the very top of the viewport. */
export function ExamProgressBar({ answered, total }: ExamProgressBarProps) {
  const pct = total > 0 ? (answered / total) * 100 : 0;
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-1 bg-ink/5"
      role="progressbar"
      aria-label="Exam completion"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <motion.div
        className="relative h-full overflow-hidden bg-brand-gradient bg-[length:200%_100%] animate-gradient-x shadow-glow"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/60 to-transparent animate-shimmer" />
      </motion.div>
    </div>
  );
}
