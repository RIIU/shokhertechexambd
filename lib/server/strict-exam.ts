import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { store } from "./store";
import type { Attempt, CandidateQuestion, ExamType, OptionId, StoredExam } from "@/lib/types";

/**
 * Strict exams (live and model tests) are served one question at a time:
 *  - the exam page never contains questions; each one is fetched only after
 *    the previous one is answered or skipped, and earlier ones are never sent again
 *  - every attempt gets its own question and option order, so "Q5 is খ"
 *    can't be passed around
 *  - answers are stored on the server as they are given, so a refresh resumes
 *    at the same question and the submission uses the server's copy
 *  - the questions are only served to the browser that started the attempt
 */

export const STRICT_TYPES: readonly ExamType[] = ["live", "model"];
export const isStrict = (exam: { type: ExamType }) => STRICT_TYPES.includes(exam.type);

export const DEVICE_COOKIE = "st_exam_device";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters) in production.");
  return "dev-only-exam-secret-change-me-0123456789";
}

/* ------------------------------ Shuffling ------------------------------ */

/** Deterministic per-attempt random stream (no need to store the order). */
function rng(seed: string) {
  let counter = 0;
  let pool = Buffer.alloc(0);
  return () => {
    if (pool.length < 4) {
      pool = createHmac("sha256", secret()).update(`${seed}:${counter++}`).digest();
    }
    const n = pool.readUInt32BE(0);
    pool = pool.subarray(4);
    return n / 2 ** 32;
  };
}

function shuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const rand = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** This attempt's question order. */
export function questionOrder(exam: StoredExam, attemptId: string) {
  return shuffle(exam.questions, `order:${attemptId}`);
}

/* ------------------------------ Device lock ----------------------------- */

/** Cookie value proving this browser started the attempt. */
export function deviceToken(attemptId: string): string {
  return createHmac("sha256", secret()).update(`device:${attemptId}`).digest("base64url");
}

export function isAttemptDevice(attemptId: string, cookie: string | undefined): boolean {
  if (!cookie) return false;
  const a = createHash("sha256").update(deviceToken(attemptId)).digest();
  const b = createHash("sha256").update(cookie).digest();
  return timingSafeEqual(a, b);
}

/* ------------------------------ Progress -------------------------------- */

export interface StrictQuestion {
  index: number;
  total: number;
  question: CandidateQuestion;
}

/** The question the student is on, with this attempt's option order. Undefined when all are done. */
export function currentQuestion(exam: StoredExam, attempt: Attempt): StrictQuestion | undefined {
  const order = questionOrder(exam, attempt.id);
  const answered = attempt.answers ?? {};
  const index = order.findIndex((q) => !(q.id in answered));
  const next = order[index];
  if (!next) return undefined;
  const { correctOptionId: _key, explanation: _exp, ...q } = next;
  return {
    index,
    total: order.length,
    question: { ...q, options: shuffle(q.options, `options:${attempt.id}:${q.id}`) },
  };
}

export type AnswerResult =
  | { ok: true; next?: StrictQuestion }
  | { ok: false; error: "not-current" | "closed" | "conflict" };

/** Records the answer (or a skip) for the current question only. */
export async function answerCurrent(
  exam: StoredExam,
  attempt: Attempt,
  questionId: string,
  optionId: OptionId | null,
): Promise<AnswerResult> {
  if (attempt.submittedAt || Date.now() > attempt.endsAt) return { ok: false, error: "closed" };
  const current = currentQuestion(exam, attempt);
  if (!current || current.question.id !== questionId) return { ok: false, error: "not-current" };
  if (optionId && !current.question.options.some((o) => o.id === optionId)) return { ok: false, error: "not-current" };

  const before = attempt.answers ?? {};
  const answers = { ...before, [questionId]: optionId };
  const saved = await (await store()).saveProgress(attempt.id, attempt.userId, answers, Object.keys(before).length);
  if (!saved) return { ok: false, error: "conflict" };
  return { ok: true, next: currentQuestion(exam, { ...attempt, answers }) };
}

/* ---------------------------- Request guard ----------------------------- */

export type StrictGuard =
  | { ok: true; exam: StoredExam; attempt: Attempt }
  | { ok: false; status: number; error: string };

/** Who may read or answer a strict attempt: its owner, from the browser that started it, while it is open. */
export async function guardStrictAttempt(attemptId: string, userId: string, deviceCookie: string | undefined): Promise<StrictGuard> {
  const s = await store();
  const attempt = await s.getAttempt(attemptId);
  if (!attempt || attempt.userId !== userId) return { ok: false, status: 404, error: "not-found" };
  const exam = await s.getExam(attempt.examId);
  if (!exam || !isStrict(exam)) return { ok: false, status: 404, error: "not-found" };
  if (!isAttemptDevice(attempt.id, deviceCookie)) return { ok: false, status: 423, error: "other-device" };
  if (attempt.submittedAt) return { ok: false, status: 409, error: "already-submitted" };
  return { ok: true, exam, attempt };
}
