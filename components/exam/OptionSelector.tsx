"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn, OPTION_LABEL_BN } from "@/lib/utils";
import type { CandidateQuestion, OptionId } from "@/lib/types";

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
