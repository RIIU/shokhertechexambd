"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flag } from "lucide-react";
import { cn, OPTION_LABEL_BN, toBn } from "@/lib/utils";
import type { CandidateQuestion, OptionId } from "@/lib/types";

interface QuestionCardProps {
  question: CandidateQuestion;
  index: number;
  total: number;
  selected: OptionId | null;
  flagged: boolean;
  onSelect: (optionId: OptionId | null) => void;
  onToggleFlag: () => void;
  /** Slide direction for the enter animation: 1 = next, -1 = previous. */
  direction: number;
}

export function QuestionCard({
  question,
  index,
  total,
  selected,
  flagged,
  onSelect,
  onToggleFlag,
  direction,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.article
        key={question.id}
        custom={direction}
        variants={{
          enter: (d: number) => ({ opacity: 0, x: d * 40, filter: "blur(4px)" }),
          center: { opacity: 1, x: 0, filter: "blur(0px)" },
          exit: (d: number) => ({ opacity: 0, x: d * -40, filter: "blur(4px)" }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-labelledby={`q-${question.id}-title`}
        className="relative overflow-hidden rounded-3xl border border-surface-border bg-obsidian-800/70 p-5 shadow-card backdrop-blur sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-400/10 blur-3xl" />

        <header className="relative mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-brand-400/10 px-2.5 py-1 font-display text-xs font-semibold text-brand-300 ring-1 ring-brand-400/25">
              <span lang="bn">প্রশ্ন {toBn(index + 1)}</span>
              <span className="mx-1 text-ink-subtle">/</span>
              <span lang="bn">{toBn(total)}</span>
            </span>
            <span lang="bn" className="chip">
              {question.topic}
            </span>
            <span lang="bn" className="chip">
              মান {toBn(question.marks)}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleFlag}
            aria-pressed={flagged}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
              flagged
                ? "border-state-flagged/50 bg-state-flagged/15 text-amber-300 shadow-[0_0_20px_-6px_rgba(245,158,11,0.6)]"
                : "border-white/10 text-ink-muted hover:border-state-flagged/40 hover:text-amber-200",
            )}
          >
            <Flag className={cn("h-3.5 w-3.5", flagged && "fill-current")} strokeWidth={1.5} />
            <span lang="bn">{flagged ? "চিহ্নিত" : "পরে দেখব"}</span>
          </button>
        </header>

        <h2
          id={`q-${question.id}-title`}
          lang="bn"
          className="relative mb-6 text-lg font-semibold leading-relaxed text-ink sm:text-xl"
        >
          {question.text}
        </h2>

        <OptionSelector
          name={question.id}
          options={question.options}
          selected={selected}
          onSelect={onSelect}
          labelledBy={`q-${question.id}-title`}
        />

        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="relative mt-4 text-xs text-ink-subtle underline-offset-4 transition-colors hover:text-ink-muted hover:underline"
          >
            <span lang="bn">উত্তর মুছে ফেলো</span>
          </button>
        )}
      </motion.article>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */

const POSITION_IDS: readonly OptionId[] = ["a", "b", "c", "d"];

interface OptionSelectorProps {
  name: string;
  options: CandidateQuestion["options"];
  selected: OptionId | null;
  onSelect: (id: OptionId) => void;
  labelledBy: string;
  /** Label options ক খ গ ঘ by position (shuffled options keep their ids but not their letters). */
  labelByPosition?: boolean;
}

/**
 * Accessible radio group (roving tabindex, Up/Down arrows) with animated
 * selection. Rendered as buttons rather than native inputs for full styling control.
 */
export function OptionSelector({ name, options, selected, onSelect, labelledBy, labelByPosition }: OptionSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      // Up/Down move between options; Left/Right are left free for question navigation.
      const delta = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!delta) return;
      e.preventDefault();
      const next = (i + delta + options.length) % options.length;
      refs.current[next]?.focus();
      const opt = options[next];
      if (opt) onSelect(opt.id);
    },
    [options, onSelect],
  );

  const focusIndex = Math.max(0, options.findIndex((o) => o.id === selected));

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="relative grid gap-3 sm:grid-cols-2">
      {options.map((opt, i) => {
        const isSelected = opt.id === selected;
        return (
          <motion.button
            key={opt.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => onSelect(opt.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            whileTap={{ scale: 0.985 }}
            data-option={`${name}-${opt.id}`}
            className={cn(
              "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors duration-200",
              isSelected
                ? "border-brand-400/70 bg-brand-400/[0.08] shadow-glow"
                : "border-surface-border bg-white/[0.02] hover:border-brand-400/30 hover:bg-white/[0.04]",
            )}
          >
            {/* Radio indicator */}
            <span
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bangla text-base font-bold transition-colors",
                isSelected
                  ? "border-brand-400 bg-brand-400 text-forest"
                  : "border-white/15 text-ink-muted group-hover:border-brand-400/50 group-hover:text-brand-300",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSelected ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span key="label" lang="bn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {OPTION_LABEL_BN[labelByPosition ? POSITION_IDS[i] ?? opt.id : opt.id]}
                  </motion.span>
                )}
              </AnimatePresence>
              {isSelected && (
                <motion.span
                  layoutId={`${name}-ring`}
                  className="absolute -inset-1 rounded-[14px] ring-2 ring-brand-400/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </span>

            <span lang="bn" className={cn("text-base leading-snug", isSelected ? "text-ink" : "text-ink/85")}>
              {opt.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
