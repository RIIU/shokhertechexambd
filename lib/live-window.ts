import type { ExamMeta } from "@/lib/types";

/**
 * Live exam timing, shared by server and browser.
 *  upcoming: before startsAt, entry closed (countdown)
 *  open:     can be started (or no schedule set)
 *  closed:   after closesAt, no new attempts; solutions and final ranks are public
 */
export type LiveState = "upcoming" | "open" | "closed";

export function liveState(exam: Pick<ExamMeta, "type" | "startsAt" | "closesAt">, now = Date.now()): LiveState {
  if (exam.type !== "live") return "open";
  if (exam.startsAt && now < exam.startsAt) return "upcoming";
  if (exam.closesAt && now > exam.closesAt) return "closed";
  return "open";
}

/** Live exams keep answers hidden until the window closes, so nobody can pass them on mid-exam. */
export function solutionsLocked(exam: Pick<ExamMeta, "type" | "startsAt" | "closesAt">, now = Date.now()): boolean {
  return exam.type === "live" && Boolean(exam.closesAt) && now <= (exam.closesAt ?? 0);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "আজ ৮:৩০ PM"-style label in Bangladesh time, independent of the device or server timezone. */
export function formatBdTime(ts: number): string {
  const d = new Date(ts + 6 * 3600 * 1000); // Asia/Dhaka is UTC+6 with no DST
  const today = new Date(Date.now() + 6 * 3600 * 1000);
  const sameDay = (a: Date, b: Date) => a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
  const tomorrow = new Date(today.getTime() + 86400000);
  const h = d.getUTCHours();
  const time = `${((h + 11) % 12) + 1}:${pad(d.getUTCMinutes())} ${h < 12 ? "AM" : "PM"}`;
  const BN = "০১২৩৪৫৬৭৮৯";
  const bn = (s: string) => s.replace(/\d/g, (c) => BN[Number(c)]!);
  const MONTHS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
  const day = sameDay(d, today) ? "আজ" : sameDay(d, tomorrow) ? "আগামীকাল" : `${bn(String(d.getUTCDate()))} ${MONTHS[d.getUTCMonth()]}`;
  return `${day} ${bn(time)}`;
}
