"use client";

import { ShieldCheck } from "lucide-react";
import { useAntiCheat } from "@/components/security/AntiCheatWrapper";
import { cn } from "@/lib/utils";

export interface Candidate {
  name: string;
  phone: string;
  roll: string;
  ip: string;
}

/** The server-side attempt: its deadline is the only one that counts. */
export interface AttemptInfo {
  id: string;
  startedAt: number;
  endsAt: number;
  strikes: number;
  /** Server clock when this was sent; used to correct a wrong device clock. */
  serverNow: number;
}

/** Shift server timestamps onto the device clock so the countdown is right even if the phone's clock is off. */
export function toLocalClock(a: AttemptInfo): AttemptInfo {
  const skew = a.serverNow - Date.now();
  return { ...a, startedAt: a.startedAt - skew, endsAt: a.endsAt - skew, serverNow: Date.now() };
}

/** Compact shield + dots showing how many strikes have been used. */
export function StrikeMeter() {
  const { strikes, maxWarnings } = useAntiCheat();
  const danger = strikes > 0;
  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-xl border px-2.5 py-2 sm:flex",
        danger ? "border-state-danger/40 bg-state-danger/10" : "border-brand-400/20 bg-brand-400/5",
      )}
      title={`Warnings ${strikes}/${maxWarnings}`}
    >
      <ShieldCheck className={cn("h-4 w-4", danger ? "text-state-danger" : "text-brand-400")} strokeWidth={1.5} />
      <div className="flex gap-1" aria-label={`Warnings ${strikes} of ${maxWarnings}`}>
        {Array.from({ length: maxWarnings }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-3 rounded-full", i < strikes ? "bg-state-danger" : "bg-white/15")} />
        ))}
      </div>
    </div>
  );
}
