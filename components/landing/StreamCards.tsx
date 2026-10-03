"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, FlaskConical, Landmark, type LucideIcon } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/accent";
import { STREAMS, STREAM_IDS, getSubjects } from "@/lib/data/catalog";
import { cn, toBn } from "@/lib/utils";
import type { Level, StreamId } from "@/lib/types";

const STREAM_ICON: Record<StreamId, LucideIcon> = {
  science: FlaskConical,
  arts: Landmark,
  commerce: Briefcase,
};

/** Three stream cards (Science / Arts / Commerce) for a level. */
export function StreamCards({ level }: { level: Level }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {STREAM_IDS.map((id, i) => {
        const stream = STREAMS[id];
        const accent = ACCENT_STYLES[stream.accent];
        const Icon = STREAM_ICON[id];
        const subjects = getSubjects(level, id);
        return (
          <motion.li
            key={`${level}-${id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/${level}/${id}`}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-surface-border bg-obsidian-800/70 p-6 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]",
                accent.glow,
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                style={{ background: accent.hex }}
              />
              <span className={cn("relative mb-8 flex h-14 w-14 items-center justify-center rounded-2xl ring-1", accent.bg, accent.text, accent.ring)}>
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <h3 lang="bn" className="relative mb-1 text-2xl font-bold text-ink">
                {stream.nameBn}
              </h3>
              <p className="relative mb-3 text-xs uppercase tracking-[0.18em] text-ink-subtle">{stream.nameEn}</p>
              <p lang="bn" className="relative mb-6 flex-1 text-sm text-ink-muted">
                {stream.taglineBn}
              </p>
              <span className="relative flex items-center justify-between border-t border-surface-border pt-4 text-sm">
                <span lang="bn" className="text-ink-muted">
                  {toBn(subjects.length)}টি বিষয়
                </span>
                <span className={cn("inline-flex items-center gap-1 font-semibold", accent.text)}>
                  <span lang="bn">শুরু করো</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </span>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
