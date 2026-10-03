import "server-only";
import { mutateDb, newId, readDb } from "./db";
import type { ExamStatus, ExamType, Level, OptionId, Question, StoredExam, StreamId, SubjectExams } from "@/lib/types";

export async function getExam(id: string): Promise<StoredExam | undefined> {
  return (await readDb()).exams.find((e) => e.id === id);
}

/** Published exams students can take. */
export async function getPublishedExam(id: string): Promise<StoredExam | undefined> {
  const exam = await getExam(id);
  return exam?.status === "published" ? exam : undefined;
}

export async function listExams(filter?: { level?: Level; stream?: StreamId; publishedOnly?: boolean }): Promise<StoredExam[]> {
  return (await readDb()).exams
    .filter((e) => (!filter?.level || e.level === filter.level) && (!filter?.stream || e.stream === filter.stream))
    .filter((e) => !filter?.publishedOnly || e.status === "published")
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Published exams per subject and type, for the subject grid. */
export async function examIndex(level: Level, stream: StreamId) {
  const exams = await listExams({ level, stream, publishedOnly: true });
  const index: Record<string, SubjectExams> = {};
  for (const e of exams) {
    const bySubject = (index[e.subjectId] ??= {});
    (bySubject[e.type] ??= []).push({ id: e.id, titleBn: e.titleBn, questions: e.questions.length, durationSec: e.durationSec });
  }
  return index;
}

export interface ExamMetaInput {
  titleBn: string;
  titleEn: string;
  level: Level;
  stream: StreamId;
  subjectId: string;
  type: ExamType;
  durationSec: number;
  negativeMark: number;
  maxWarnings: number;
}

export async function createExam(input: ExamMetaInput): Promise<StoredExam> {
  return mutateDb((db) => {
    const now = Date.now();
    const exam: StoredExam = { id: newId("exm"), ...input, questions: [], status: "draft", createdAt: now, updatedAt: now };
    db.exams.push(exam);
    return exam;
  });
}

export async function updateExamMeta(id: string, input: ExamMetaInput): Promise<void> {
  await mutateDb((db) => {
    const exam = db.exams.find((e) => e.id === id);
    if (exam) Object.assign(exam, input, { updatedAt: Date.now() });
  });
}

export async function setExamStatus(id: string, status: ExamStatus): Promise<"ok" | "no-questions"> {
  return mutateDb((db) => {
    const exam = db.exams.find((e) => e.id === id);
    if (!exam) return "ok" as const;
    if (status === "published" && exam.questions.length === 0) return "no-questions" as const;
    exam.status = status;
    exam.updatedAt = Date.now();
    return "ok" as const;
  });
}

export async function deleteExam(id: string): Promise<"ok" | "has-attempts"> {
  return mutateDb((db) => {
    if (db.attempts.some((a) => a.examId === id)) return "has-attempts" as const;
    db.exams = db.exams.filter((e) => e.id !== id);
    return "ok" as const;
  });
}

export interface QuestionInput {
  text: string;
  options: Record<OptionId, string>;
  correctOptionId: OptionId;
  explanation: string;
  topic: string;
  marks: number;
}

export async function addQuestion(examId: string, input: QuestionInput): Promise<void> {
  await mutateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;
    const question: Question = {
      id: newId("q"),
      text: input.text,
      options: (["a", "b", "c", "d"] as const).map((id) => ({ id, text: input.options[id] })),
      correctOptionId: input.correctOptionId,
      explanation: input.explanation,
      topic: input.topic,
      marks: input.marks,
    };
    exam.questions.push(question);
    exam.updatedAt = Date.now();
  });
}

export async function deleteQuestion(examId: string, questionId: string): Promise<void> {
  await mutateDb((db) => {
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return;
    exam.questions = exam.questions.filter((q) => q.id !== questionId);
    if (exam.questions.length === 0) exam.status = "draft";
    exam.updatedAt = Date.now();
  });
}
