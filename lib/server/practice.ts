import "server-only";
import { listAttempts } from "./attempts";
import { listExams } from "./exams";
import { getSubjects } from "@/lib/data/catalog";
import type { Level, OptionId, QuestionOption, StoredExam, StreamId, Subject } from "@/lib/types";

/**
 * Question bank: published practice sets (exam type "practice"), one per
 * chapter or topic, grouped by subject. Admins build it from the exam editor.
 */

export interface PracticeSet {
  id: string;
  titleBn: string;
  questions: number;
  durationSec: number;
  /** Viewer's best score in percent, if they finished it. */
  best?: number;
  attempts: number;
}

export interface PracticeSubject {
  subject: Subject;
  sets: PracticeSet[];
  questions: number;
  /** Sets the viewer has finished at least once. */
  done: number;
}

async function bestScores(userId: string | undefined) {
  const best = new Map<string, { best: number; attempts: number }>();
  if (!userId) return best;
  for (const a of await listAttempts({ userId, submittedOnly: true })) {
    const r = a.result;
    if (!r) continue;
    const pct = r.totalMarks > 0 ? Math.max(0, Math.round((r.score / r.totalMarks) * 100)) : 0;
    const cur = best.get(a.examId);
    best.set(a.examId, { best: Math.max(cur?.best ?? 0, pct), attempts: (cur?.attempts ?? 0) + 1 });
  }
  return best;
}

const toSet = (e: StoredExam, mine?: { best: number; attempts: number }): PracticeSet => ({
  id: e.id,
  titleBn: e.titleBn,
  questions: e.questions.length,
  durationSec: e.durationSec,
  best: mine?.best,
  attempts: mine?.attempts ?? 0,
});

const byTitle = (a: PracticeSet, b: PracticeSet) => a.titleBn.localeCompare(b.titleBn, "bn", { numeric: true });

/** Every subject of a level + stream with its practice sets (subjects without sets come last). */
export async function practiceCatalog(level: Level, stream: StreamId, userId?: string): Promise<PracticeSubject[]> {
  const [exams, best] = await Promise.all([listExams({ level, stream, publishedOnly: true }), bestScores(userId)]);
  const practice = exams.filter((e) => e.type === "practice" && e.questions.length > 0);
  return getSubjects(level, stream)
    .map((subject) => {
      const sets = practice
        .filter((e) => e.subjectId === subject.id)
        .map((e) => toSet(e, best.get(e.id)))
        .sort(byTitle);
      return {
        subject,
        sets,
        questions: sets.reduce((n, s) => n + s.questions, 0),
        done: sets.filter((s) => s.best !== undefined).length,
      };
    })
    .sort((a, b) => Number(b.sets.length > 0) - Number(a.sets.length > 0));
}

export interface Mistake {
  examId: string;
  examTitle: string;
  /** Only practice sets can be retaken freely. */
  retake: boolean;
  subjectId: string;
  questionId: string;
  text: string;
  topic: string;
  options: QuestionOption[];
  yours: OptionId;
  /** Only when the exam shows solutions. */
  correct?: OptionId;
  explanation?: string;
  at: number;
}

/** Questions the student most recently got wrong (dropped once they answer it right later). */
export async function recentMistakes(userId: string, limit = 60): Promise<Mistake[]> {
  const attempts = (await listAttempts({ userId, submittedOnly: true })).sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));
  const examIds = new Set(attempts.map((a) => a.examId));
  const exams = new Map((await listExams({ publishedOnly: false })).filter((e) => examIds.has(e.id)).map((e) => [e.id, e]));

  const seen = new Set<string>();
  const out: Mistake[] = [];
  for (const a of attempts) {
    const exam = exams.get(a.examId);
    if (!exam || !a.result) continue;
    const reveal = exam.showSolutions !== false;
    for (const q of a.result.questions) {
      const key = `${a.examId}:${q.id}`;
      if (seen.has(key)) continue;
      seen.add(key); // newest attempt decides
      if (q.status !== "wrong" || !q.selectedOptionId) continue;
      out.push({
        examId: a.examId,
        examTitle: exam.titleBn,
        retake: exam.type === "practice" && exam.status === "published",
        subjectId: exam.subjectId,
        questionId: q.id,
        text: q.text,
        topic: q.topic,
        options: q.options,
        yours: q.selectedOptionId,
        correct: reveal ? q.correctOptionId : undefined,
        explanation: reveal ? q.explanation : undefined,
        at: a.submittedAt ?? a.startedAt,
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
