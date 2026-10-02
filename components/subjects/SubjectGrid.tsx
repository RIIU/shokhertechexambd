"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SubjectCard } from "./SubjectCard";
import { ExamTypeSheet } from "./ExamTypeSheet";
import { cn, toBn } from "@/lib/utils";
import type { Level, StreamId, Subject } from "@/lib/types";

gsap.registerPlugin(useGSAP);

type Filter = "all" | "stream" | "compulsory";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "সব বিষয়" },
  { id: "stream", label: "বিভাগভিত্তিক" },
  { id: "compulsory", label: "আবশ্যিক" },
];

interface SubjectGridProps {
  subjects: Subject[];
  level: Level;
  stream: StreamId;
}

export function SubjectGrid({ subjects, level, stream }: SubjectGridProps) {
  const container = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Subject | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      if (filter === "stream" && s.compulsory) return false;
      if (filter === "compulsory" && !s.compulsory) return false;
      if (!q) return true;
      return s.nameBn.includes(q) || s.nameEn.toLowerCase().includes(q) || s.code.includes(q);
    });
  }, [subjects, filter, query]);

  // Staggered grid load. Re-runs whenever the filter/search changes the visible set.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-grid-item]", {
          opacity: 0,
          y: 36,
          scale: 0.96,
          duration: 0.7,
          ease: "power3.out",
          stagger: { each: 0.05, grid: "auto", from: "start" },
        });
      });
      return () => mm.revert();
    },
    { scope: container, dependencies: [visible], revertOnUpdate: true },
  );

  return (
    <div ref={container}>
      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter subjects" className="glass inline-flex self-start rounded-2xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "relative rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                filter === f.id ? "text-obsidian-900" : "text-ink-muted hover:text-ink",
              )}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="subject-filter"
                  className="absolute inset-0 rounded-xl bg-brand-400 shadow-glow"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span lang="bn" className="relative">
                {f.label}
              </span>
            </button>
          ))}
        </div>

        <label className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5 focus-within:border-brand-400/40 sm:w-72">
          <Search className="h-4 w-4 text-ink-subtle" strokeWidth={1.5} />
          <span className="sr-only">Search subjects</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="বিষয় খুঁজো… (Physics, ১৩৬)"
            lang="bn"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
        </label>
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((s) => (
            <li key={s.id} data-grid-item className="[perspective:1000px]">
              <SubjectCard subject={s} onOpen={setActive} />
            </li>
          ))}
        </ul>
      ) : (
        <p lang="bn" className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-ink-muted">
          &ldquo;{query}&rdquo; নামে কোনো বিষয় পাওয়া যায়নি।
        </p>
      )}

      <p lang="bn" className="mt-6 text-center text-xs text-ink-subtle">
        মোট {toBn(visible.length)}টি বিষয় দেখানো হচ্ছে
      </p>

      <ExamTypeSheet subject={active} level={level} stream={stream} onClose={() => setActive(null)} />
    </div>
  );
}
