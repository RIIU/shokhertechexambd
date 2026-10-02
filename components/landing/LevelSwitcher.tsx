"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StreamCards } from "./StreamCards";
import { LEVELS } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import type { Level } from "@/lib/types";

const LEVEL_IDS: Level[] = ["ssc", "hsc"];

/** [SSC Exam System] | [HSC Exam System] toggle that swaps the stream cards below. */
export function LevelSwitcher({ initial = "ssc" }: { initial?: Level }) {
  const [level, setLevel] = useState<Level>(initial);

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div role="tablist" aria-label="Exam level" className="glass relative inline-flex rounded-2xl p-1.5 shadow-card">
          {LEVEL_IDS.map((id) => {
            const active = id === level;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                aria-controls="level-panel"
                onClick={() => setLevel(id)}
                className={cn(
                  "relative rounded-xl px-5 py-3 text-left transition-colors sm:px-8",
                  active ? "text-obsidian-900" : "text-ink-muted hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="level-pill"
                    className="absolute inset-0 rounded-xl bg-brand-400 shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative block font-display text-lg font-bold leading-none">{LEVELS[id].nameEn}</span>
                <span lang="bn" className="relative mt-1 block text-xs opacity-80">
                  {LEVELS[id].nameBn} পরীক্ষা সিস্টেম
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          id="level-panel"
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <StreamCards level={level} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
