import type {
  Answers,
  CandidateExam,
  Exam,
  ExamResult,
  OptionId,
  QuestionResult,
  SubmitPayload,
  SubmitReason,
} from "@/lib/types";
import { EXAM_BANK } from "./bank";

/**
 * Exam data access. SERVER-ONLY (imports the answer key).
 * Swap the EXAM_BANK lookups for database queries in production.
 */

const OPTION_IDS: readonly OptionId[] = ["a", "b", "c", "d"];
const SUBMIT_REASONS: readonly SubmitReason[] = ["manual", "time-up", "max-warnings"];

export function getExam(id: string): Exam | undefined {
  return EXAM_BANK[id];
}

/** Strips the answer key and explanations before data leaves the server. */
export function toCandidateExam(exam: Exam): CandidateExam {
  const { questions, ...meta } = exam;
  return {
    ...meta,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    questions: questions.map(({ correctOptionId: _key, explanation: _exp, ...q }) => q),
  };
}

/** Validates an untrusted request body. Returns null when malformed. */
export function parseSubmitPayload(body: unknown, exam: Exam): SubmitPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;
  if (typeof raw.answers !== "object" || raw.answers === null) return null;

  const answers: Answers = {};
  const given = raw.answers as Record<string, unknown>;
  for (const q of exam.questions) {
    const value = given[q.id];
    answers[q.id] = OPTION_IDS.includes(value as OptionId) ? (value as OptionId) : null;
  }

  const reason = SUBMIT_REASONS.includes(raw.reason as SubmitReason) ? (raw.reason as SubmitReason) : "manual";
  const timeTakenSec = Number(raw.timeTakenSec);
  const strikes = Number(raw.strikes);

  return {
    answers,
    reason,
    timeTakenSec: Number.isFinite(timeTakenSec) ? Math.min(Math.max(0, timeTakenSec), exam.durationSec) : exam.durationSec,
    strikes: Number.isFinite(strikes) ? Math.max(0, Math.floor(strikes)) : 0,
  };
}

/**
 * Simulated cohort so the result page can show a rank. Replace with a
 * leaderboard query (e.g. Redis sorted set keyed by exam id) in production.
 */
function estimateRank(score: number, totalMarks: number, examId: string) {
  const participants = 3000 + ([...examId].reduce((a, c) => a + c.charCodeAt(0), 0) % 2500);
  const ratio = totalMarks > 0 ? score / totalMarks : 0;
  // Logistic curve centred at 55% with a moderate spread.
  const percentile = 1 / (1 + Math.exp(-(ratio - 0.55) * 9));
  const rank = Math.max(1, Math.round(participants * (1 - percentile)));
  return { rank, participants };
}

export function gradeExam(exam: Exam, payload: SubmitPayload): ExamResult {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let score = 0;
  const topicMap = new Map<string, { correct: number; total: number }>();

  const questions: QuestionResult[] = exam.questions.map((q) => {
    const selected = payload.answers[q.id] ?? null;
    const status: QuestionResult["status"] =
      selected === null ? "skipped" : selected === q.correctOptionId ? "correct" : "wrong";

    if (status === "correct") {
      correct += 1;
      score += q.marks;
    } else if (status === "wrong") {
      wrong += 1;
      score -= exam.negativeMark;
    } else {
      skipped += 1;
    }

    const t = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (status === "correct") t.correct += 1;
    topicMap.set(q.topic, t);

    return {
      id: q.id,
      text: q.text,
      options: q.options,
      topic: q.topic,
      selectedOptionId: selected,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      status,
    };
  });

  const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);
  const finalScore = Math.max(0, Math.round(score * 100) / 100);
  const attempted = correct + wrong;

  return {
    examId: exam.id,
    titleBn: exam.titleBn,
    score: finalScore,
    totalMarks,
    correct,
    wrong,
    skipped,
    accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    ...estimateRank(finalScore, totalMarks, exam.id),
    timeTakenSec: Math.round(payload.timeTakenSec),
    strikes: payload.strikes,
    reason: payload.reason,
    topics: [...topicMap.entries()].map(([topic, v]) => ({ topic, ...v })),
    questions,
    submittedAt: Date.now(),
  };
}
