import "server-only";
import { gradeExam } from "@/lib/exams/grading";
import { store } from "./store";
import { newId } from "./ids";
import { liveState } from "@/lib/live-window";
import type { Attempt, ExamResult, StoredExam, StoredViolation, SubmitPayload, ViolationEvent } from "@/lib/types";

/** Answers arriving later than this after the deadline are discarded. */
export const SUBMIT_GRACE_MS = 2 * 60 * 1000;

export type StartResult =
  | { ok: true; attempt: Attempt; created: boolean }
  | { ok: false; error: "already-submitted"; attemptId: string }
  | { ok: false; error: "not-started" | "closed" };

/**
 * Starts (or resumes) an attempt. The server clock sets the deadline, so
 * refreshing, changing the device clock or reopening the tab never buys time.
 * Live exams allow one submission per student.
 */
export async function startAttempt(
  exam: StoredExam,
  userId: string,
  meta: { ip?: string; userAgent?: string },
  opts: { ignoreSchedule?: boolean } = {},
): Promise<StartResult> {
  const s = await store();
  const mine = await s.findAttempts({ examId: exam.id, userId });
  const open = mine.find((a) => !a.submittedAt);
  if (open) return { ok: true, attempt: open, created: false };
  const done = mine.find((a) => a.submittedAt);
  if (exam.type === "live" && done) return { ok: false, error: "already-submitted", attemptId: done.id };

  const now = Date.now();
  const state = liveState(exam, now);
  if (!opts.ignoreSchedule && state !== "open") return { ok: false, error: state === "upcoming" ? "not-started" : "closed" };
  // A scheduled live exam ends for everyone at closesAt, however late they joined.
  const endsAt = Math.min(now + exam.durationSec * 1000, exam.type === "live" && exam.closesAt ? exam.closesAt : Infinity);
  const attempt: Attempt = {
    id: newId("att"),
    examId: exam.id,
    userId,
    startedAt: now,
    endsAt,
    strikes: 0,
    ...meta,
  };
  if ((await s.insertAttempt(attempt)) === "conflict") {
    // Two tabs pressed "start" at once: resume the one that won.
    const winner = (await s.findAttempts({ examId: exam.id, userId, submitted: false }))[0];
    if (winner) return { ok: true, attempt: winner, created: false };
  }
  return { ok: true, attempt, created: true };
}

export async function getOpenAttempt(examId: string, userId: string): Promise<Attempt | undefined> {
  return (await (await store()).findAttempts({ examId, userId, submitted: false }))[0];
}

export async function getSubmittedLiveAttempt(examId: string, userId: string): Promise<Attempt | undefined> {
  return (await (await store()).findAttempts({ examId, userId, submitted: true, limit: 1 }))[0];
}

export async function getUserAttempt(attemptId: string, userId: string): Promise<Attempt | undefined> {
  const a = await (await store()).getAttempt(attemptId);
  return a?.userId === userId ? a : undefined;
}

export type SubmitResult = { ok: true; attemptId: string } | { ok: false; error: "not-found" | "already-submitted" };

export async function submitAttempt(attemptId: string, userId: string, exam: StoredExam, payload: SubmitPayload): Promise<SubmitResult> {
  const s = await store();
  const attempt = await s.getAttempt(attemptId);
  if (!attempt || attempt.userId !== userId || attempt.examId !== exam.id) return { ok: false, error: "not-found" };
  if (attempt.submittedAt) return { ok: false, error: "already-submitted" };

  const now = Date.now();
  const tooLate = now > attempt.endsAt + SUBMIT_GRACE_MS;
  // Strikes: trust whichever is higher, the server log or the client count.
  const strikes = Math.max(await s.countStrikes(attempt.id), attempt.strikes, payload.strikes);
  const answers = tooLate ? {} : payload.answers;
  const graded = gradeExam(exam, {
    answers,
    reason: tooLate ? "time-up" : payload.reason,
    strikes,
    timeTakenSec: (Math.min(now, attempt.endsAt) - attempt.startedAt) / 1000,
  });

  const saved = await s.completeAttempt(attempt.id, userId, {
    submittedAt: now,
    reason: graded.reason,
    answers,
    strikes,
    result: { ...graded, attemptId: attempt.id },
  });
  return saved ? { ok: true, attemptId: attempt.id } : { ok: false, error: "already-submitted" };
}

/** Rank among everyone who submitted the exam (ties share a rank). */
export function rankFrom(scores: number[] | undefined, score: number) {
  const list = scores ?? [];
  return { rank: 1 + list.filter((s) => s > score).length, participants: list.length };
}

export async function getResult(attemptId: string): Promise<{ attempt: Attempt; result: ExamResult } | undefined> {
  const s = await store();
  const attempt = await s.getAttempt(attemptId);
  if (!attempt?.result) return undefined;
  const scores = (await s.scoresByExam([attempt.examId])).get(attempt.examId);
  return { attempt, result: { ...attempt.result, ...rankFrom(scores, attempt.result.score) } };
}

export async function listAttempts(filter?: { userId?: string; examId?: string; submittedOnly?: boolean; limit?: number }): Promise<Attempt[]> {
  return (await store()).findAttempts({
    userId: filter?.userId,
    examId: filter?.examId,
    submitted: filter?.submittedOnly ? true : undefined,
    limit: filter?.limit,
  });
}

export async function scoresByExam(examIds: string[]): Promise<Map<string, number[]>> {
  return (await store()).scoresByExam(examIds);
}

export async function recordViolation(
  event: ViolationEvent,
  ctx: { examId: string; attemptId?: string; userId?: string; ip?: string },
): Promise<void> {
  const s = await store();
  // Only link the event to an attempt that belongs to this user.
  const attempt = ctx.attemptId && ctx.userId ? await s.getAttempt(ctx.attemptId) : undefined;
  const linked = attempt && attempt.userId === ctx.userId && attempt.examId === ctx.examId ? attempt.id : undefined;
  const stored: StoredViolation = {
    id: newId("vio"),
    ...event,
    at: Date.now(), // server time, not the client's claim
    examId: ctx.examId,
    attemptId: linked,
    userId: ctx.userId,
    ip: ctx.ip,
  };
  await s.insertViolation(stored);
}

export async function listViolations(filter: { strikeOnly?: boolean; attemptId?: string; since?: number; limit?: number }): Promise<StoredViolation[]> {
  return (await store()).listViolations(filter);
}
