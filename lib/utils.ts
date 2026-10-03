import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OptionId } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** 2026 → "২০২৬". Leaves non-digit characters untouched. */
export function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/** 754 → "১২:৩৪"; 3725 → "১:০২:০৫". */
export function formatClock(totalSeconds: number, bangla = true): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const out = h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  return bangla ? toBn(out) : out;
}

/** 900 → "১৫ মিনিট". */
export function formatMinutesBn(totalSeconds: number): string {
  return `${toBn(Math.round(totalSeconds / 60))} মিনিট`;
}

/** Bangla MCQ option labels used on board exam papers. */
export const OPTION_LABEL_BN: Record<OptionId, string> = {
  a: "ক",
  b: "খ",
  c: "গ",
  d: "ঘ",
};

const BN_DATE = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
const BN_DATETIME = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Dhaka",
});

/** 1790986964000 → "৩ অক্টো, ২০২৬" (Bangladesh time). */
export function formatDateBn(ts: number, withTime = false): string {
  return (withTime ? BN_DATETIME : BN_DATE).format(ts);
}
