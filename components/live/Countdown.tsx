"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toBn } from "@/lib/utils";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => toBn(String(n).padStart(2, "0"));

/** Ticks down to `to`; refreshes the page when it reaches zero so the next state renders. */
function useRemaining(to: number, refreshAtZero: boolean) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (refreshAtZero && t >= to) {
        window.clearInterval(id);
        // A little after zero, so the server agrees the window is open.
        window.setTimeout(() => router.refresh(), 1200);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [to, refreshAtZero, router]);
  return now === null ? null : to - now;
}

/** Large day/hour/minute/second tiles for the exam's waiting room. */
export function BigCountdown({ to }: { to: number }) {
  const left = useRemaining(to, true);
  const p = parts(left ?? 0);
  const tiles = [
    { v: p.d, k: "দিন" },
    { v: p.h, k: "ঘণ্টা" },
    { v: p.m, k: "মিনিট" },
    { v: p.s, k: "সেকেন্ড" },
  ].filter((t, i) => i > 0 || t.v > 0);
  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
      {tiles.map((t) => (
        <div key={t.k} className="w-16 rounded-2xl border border-surface-border bg-obsidian-900/70 py-3 text-center sm:w-20">
          <p lang="bn" className="font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl">
            {left === null ? "--" : pad(t.v)}
          </p>
          <p lang="bn" className="text-[11px] text-ink-subtle">
            {t.k}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Compact "২ ঘণ্টা ১৫ মিনিট" / "০৪:৫৯" label for cards. */
export function InlineCountdown({ to, refresh = false }: { to: number; refresh?: boolean }) {
  const left = useRemaining(to, refresh);
  if (left === null) return <span>…</span>;
  const p = parts(left);
  if (p.d > 0) return <span lang="bn">{toBn(p.d)} দিন {toBn(p.h)} ঘণ্টা</span>;
  if (p.h > 0) return <span lang="bn">{toBn(p.h)} ঘণ্টা {toBn(p.m)} মিনিট</span>;
  return (
    <span lang="bn" className="tabular-nums">
      {pad(p.m)}:{pad(p.s)}
    </span>
  );
}
