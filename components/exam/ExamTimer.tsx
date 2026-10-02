"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { cn, formatClock } from "@/lib/utils";

interface ExamTimerProps {
  /** Absolute deadline (epoch ms). Derived from the attempt start, so throttled tabs or reloads can't gain time. */
  endsAt: number;
  durationSec: number;
  onExpire: () => void;
  /** Seconds left at which the danger state kicks in. */
  dangerAt?: number;
  warnAt?: number;
  compact?: boolean;
}

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ExamTimer({ endsAt, durationSec, onExpire, dangerAt = 300, warnAt = 600, compact }: ExamTimerProps) {
  const [left, setLeft] = useState(() => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0 && !expired.current) {
        expired.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const state = left <= dangerAt ? "danger" : left <= warnAt ? "warn" : "ok";
  const progress = durationSec > 0 ? left / durationSec : 0;

  const tone = {
    ok: { text: "text-brand-300", stroke: "#99FE00", ring: "border-brand-400/25 shadow-glow-sm" },
    warn: { text: "text-amber-300", stroke: "#FBBF24", ring: "border-amber-400/40" },
    danger: { text: "text-rose-300", stroke: "#F43F5E", ring: "border-state-danger/60 animate-danger-pulse" },
  }[state];

  return (
    <div
      role="timer"
      aria-live={state === "danger" ? "assertive" : "off"}
      aria-label={`Time remaining ${formatClock(left, false)}`}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border bg-obsidian-800/80 px-3 py-2 backdrop-blur",
        tone.ring,
      )}
    >
      <div className="relative h-11 w-11 shrink-0">
        <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
          <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            stroke={tone.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
            style={{ filter: `drop-shadow(0 0 4px ${tone.stroke})` }}
          />
        </svg>
        <Timer className={cn("absolute inset-0 m-auto h-4 w-4", tone.text)} strokeWidth={1.5} />
        {state === "danger" && <span className="absolute inset-0 rounded-full bg-state-danger/30 animate-pulse-ring" />}
      </div>
      <div className="leading-tight">
        {!compact && (
          <p lang="bn" className="text-[11px] text-ink-muted">
            {state === "danger" ? "সময় প্রায় শেষ!" : "বাকি সময়"}
          </p>
        )}
        <p className={cn("font-display text-xl font-bold tabular-nums tracking-tight", tone.text)}>
          <span lang="bn">{formatClock(left)}</span>
        </p>
      </div>
    </div>
  );
}
