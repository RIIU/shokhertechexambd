"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, BookMarked, Layers } from "lucide-react";
import { SubjectIcon } from "./SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { cn, toBn } from "@/lib/utils";
import type { Subject } from "@/lib/types";

interface SubjectCardProps {
  subject: Subject;
  onOpen: (subject: Subject) => void;
}

gsap.registerPlugin(useGSAP);

/**
 * Subject tile with a cursor-following spotlight, 3D tilt (GSAP quickTo) and
 * an animated conic border when a live exam is running for the subject.
 */
export function SubjectCard({ subject, onOpen }: SubjectCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const accent = ACCENT_STYLES[subject.accent];
  const live = Boolean(subject.featuredExamIds?.live);

  const { contextSafe } = useGSAP({ scope: ref });

  const onMove = contextSafe((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    gsap.to(el, {
      rotateY: (x - 0.5) * 10,
      rotateX: (0.5 - y) * 10,
      transformPerspective: 900,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  });

  const onEnter = contextSafe(() => {
    gsap.to(".subject-icon", { scale: 1.12, rotate: -8, duration: 0.45, ease: "back.out(3)" });
    gsap.to(".subject-arrow", { x: 3, y: -3, opacity: 1, duration: 0.3, ease: "power2.out" });
  });

  const onLeave = contextSafe(() => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    gsap.to(".subject-icon", { scale: 1, rotate: 0, duration: 0.4, ease: "power3.out" });
    gsap.to(".subject-arrow", { x: 0, y: 0, opacity: 0.4, duration: 0.3 });
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(subject)}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      data-subject-card
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 text-left shadow-card transition-shadow duration-300 [transform-style:preserve-3d] will-change-transform",
        live
          ? "border-animated animate-border-spin shadow-glow"
          : cn("border border-white/[0.06] bg-obsidian-800/80 hover:border-white/[0.12]", accent.glow),
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
            "subject-icon flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
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
            <ArrowUpRight className="subject-arrow h-5 w-5 text-ink-muted opacity-40" strokeWidth={1.5} />
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

      <dl className="relative grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4 text-xs">
        <div className="flex items-center gap-1.5 text-ink-muted">
          <BookMarked className="h-3.5 w-3.5" strokeWidth={1.5} />
          <dt className="sr-only">Chapters</dt>
          <dd lang="bn">{toBn(subject.chapters)} অধ্যায়</dd>
        </div>
        <div className="flex items-center gap-1.5 text-ink-muted">
          <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
          <dt className="sr-only">Exams</dt>
          <dd lang="bn">
            {toBn(Object.values(subject.exams).reduce((a, b) => a + b, 0))} পরীক্ষা
          </dd>
        </div>
      </dl>
    </button>
  );
}
