import "server-only";
import { gradeExam } from "@/lib/exams/grading";
import { mutateDb, newId, readDb } from "./db";
import type { Attempt, ExamResult, StoredExam, StoredViolation, SubmitPayload, ViolationEvent } from "@/lib/types";

/** Answers arriving later than this after the deadline are discarded. */
export const SUBMIT_GRACE_MS = 2 * 60 * 1000;

export type StartResult =
  | { ok: true; attempt: Attempt }
  | { ok: false; error: "already-submitted"; attemptId: string };

/**
 * Starts (or resumes) an attempt. The server clock sets the deadline, so
 * refreshing, changing the device clock or reopening the tab never buys time.
 * Live exams allow one submission per student.
 */
export async function startAttempt(exam: StoredExam, userId: string, meta: { ip?: string; userAgent?: string }): Promise<StartResult> {
  return mutateDb((db) => {
    const mine = db.attempts.filter((a) => a.examId === exam.id && a.userId === userId);
    const open = mine.find((a) => !a.submittedAt);
    if (open) return { ok: true as const, attempt: open };
    const done = mine.find((a) => a.submittedAt);
    if (exam.type === "live" && done) return { ok: false as const, error: "already-submitted" as const, attemptId: done.id };

    const now = Date.now();
    const attempt: Attempt = {
      id: newId("att"),
      examId: exam.id,
      userId,
      startedAt: now,
      endsAt: now + exam.durationSec * 1000,
      strikes: 0,
      ...meta,
    };
    db.attempts.push(attempt);
    return { ok: true as const, attempt };
  });
}

export async function getOpenAttempt(examId: string, userId: string): Promise<Attempt | undefined> {
  return (await readDb()).attempts.find((a) => a.examId === examId && a.userId === userId && !a.submittedAt);
}

export async function getSubmittedLiveAttempt(examId: string, userId: string): Promise<Attempt | undefined> {
  return (await readDb()).attempts.find((a) => a.examId === examId && a.userId === userId && a.submittedAt);
}

export type SubmitResult =
  | { ok: true; attemptId: string }
  | { ok: false; error: "not-found" | "already-submitted" };

export async function submitAttempt(
  attemptId: string,
  userId: string,
  exam: StoredExam,
  payload: SubmitPayload,
): Promise<SubmitResult> {
  return mutateDb((db) => {
    const attempt = db.attempts.find((a) => a.id === attemptId && a.userId === userId && a.examId === exam.id);
    if (!attempt) return { ok: false as const, error: "not-found" as const };
    if (attempt.submittedAt) return { ok: false as const, error: "already-submitted" as const };

    const now = Date.now();
    const tooLate = now > attempt.endsAt + SUBMIT_GRACE_MS;
    // Strikes: trust whichever is higher, the server log or the client count.
    const serverStrikes = db.violations.filter((v) => v.attemptId === attempt.id && v.strike).length;
    const strikes = Math.max(serverStrikes, payload.strikes);
    const graded = gradeExam(exam, {
      answers: tooLate ? {} : payload.answers,
      reason: tooLate ? "time-up" : payload.reason,
      strikes,
      timeTakenSec: (Math.min(now, attempt.endsAt) - attempt.startedAt) / 1000,
    });

    attempt.submittedAt = now;
    attempt.reason = graded.reason;
    attempt.answers = tooLate ? {} : payload.answers;
    attempt.strikes = strikes;
    attempt.result = { ...graded, attemptId: attempt.id };
    return { ok: true as const, attemptId: attempt.id };
  });
}

/** Rank among everyone who has submitted this exam (ties share a rank). */
export function rankFor(attempts: Attempt[], examId: string, score: number) {
  const done = attempts.filter((a) => a.examId === examId && a.result);
  return {
    rank: 1 + done.filter((a) => (a.result?.score ?? 0) > score).length,
    participants: done.length,
  };
}

export async function getResult(attemptId: string): Promise<{ attempt: Attempt; result: ExamResult } | undefined> {
  const db = await readDb();
  const attempt = db.attempts.find((a) => a.id === attemptId);
  if (!attempt?.result) return undefined;
  return { attempt, result: { ...attempt.result, ...rankFor(db.attempts, attempt.examId, attempt.result.score) } };
}

export async function listAttempts(filter?: { userId?: string; submittedOnly?: boolean }): Promise<Attempt[]> {
  return (await readDb()).attempts
    .filter((a) => (!filter?.userId || a.userId === filter.userId) && (!filter?.submittedOnly || a.submittedAt))
    .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt));
}

export async function recordViolation(
  event: ViolationEvent,
  ctx: { examId: string; attemptId?: string; userId?: string; ip?: string },
): Promise<void> {
  await mutateDb((db) => {
    const attempt = ctx.attemptId ? db.attempts.find((a) => a.id === ctx.attemptId && a.userId === ctx.userId) : undefined;
    const stored: StoredViolation = {
      id: newId("vio"),
      ...event,
      at: Date.now(), // server time, not the client's claim
      examId: ctx.examId,
      attemptId: attempt?.id,
      userId: ctx.userId,
      ip: ctx.ip,
    };
    db.violations.push(stored);
    if (attempt && !attempt.submittedAt && event.strike) attempt.strikes += 1;
    // Keep the log bounded.
    if (db.violations.length > 20000) db.violations.splice(0, db.violations.length - 20000);
  });
}

export async function listViolations(): Promise<StoredViolation[]> {
  return [...(await readDb()).violations].sort((a, b) => b.at - a.at);
}
