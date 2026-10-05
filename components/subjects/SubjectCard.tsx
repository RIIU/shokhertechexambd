"use client";

import { useRef } from "react";
import { ArrowUpRight, BookMarked, Layers } from "lucide-react";
import { SubjectIcon } from "./SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { cn, toBn } from "@/lib/utils";
import type { Subject } from "@/lib/types";

interface SubjectCardProps {
  subject: Subject;
  onOpen: (subject: Subject) => void;
}

/**
 * Subject tile with a cursor-following spotlight and smooth CSS transitions.
 */
export function SubjectCard({ subject, onOpen }: SubjectCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const accent = ACCENT_STYLES[subject.accent] ?? ACCENT_STYLES.brand;
  const live = Boolean(subject.available?.live?.length);
  const examCount = Object.values(subject.available ?? {}).reduce((n, list) => n + (list?.length ?? 0), 0);

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(subject)}
      onPointerMove={onMove}
      data-subject-card
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 will-change-transform",
        live
          ? "border-animated animate-border-spin shadow-glow"
          : cn("border border-surface-border bg-white hover:border-leaf-600", accent.glow),
      )}
    >
      {/* Cursor spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${accent.hex}1f, transparent 45%)`,
        }}
      />

      <div className="relative mb-6 flex items-start justify-between">
        <span
          className={cn(
            "subject-icon flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            accent.bg,
            accent.text,
            accent.ring,
          )}
        >
          <SubjectIcon icon={subject.icon} className="h-6 w-6" />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-state-danger/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300 ring-1 ring-state-danger/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
              </span>
              <span lang="bn">লাইভ চলছে</span>
            </span>
          ) : (
            <ArrowUpRight className="subject-arrow h-5 w-5 text-ink-muted opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-brand-300" strokeWidth={1.5} />
          )}
          {subject.compulsory && (
            <span lang="bn" className="text-[10px] font-medium text-ink-subtle">
              আবশ্যিক
            </span>
          )}
        </div>
      </div>

      <div className="relative mb-5 flex-1">
        <h3 lang="bn" className="mb-1 text-xl font-bold leading-snug text-ink">
          {subject.nameBn}
        </h3>
        <p className="text-xs text-ink-muted">
          {subject.nameEn} · <span className="font-mono">{subject.code}</span>
        </p>
      </div>

      <dl className="relative grid grid-cols-2 gap-2 border-t border-surface-border pt-4 text-xs">
        <div className="flex items-center gap-1.5 text-ink-muted">
          <BookMarked className="h-3.5 w-3.5" strokeWidth={1.5} />
          <dt className="sr-only">Chapters</dt>
          <dd lang="bn">{toBn(subject.chapters)} অধ্যায়</dd>
        </div>
        <div className="flex items-center gap-1.5 text-ink-muted">
          <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
          <dt className="sr-only">Exams</dt>
          <dd lang="bn">
            {examCount ? `${toBn(examCount)}টি পরীক্ষা` : "শীঘ্রই আসছে"}
          </dd>
        </div>
      </dl>
    </button>
  );
}
