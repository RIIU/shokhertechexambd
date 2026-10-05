import "server-only";
import { store } from "./store";
import { newId } from "./ids";
import type { ExamStatus, ExamType, Level, OptionId, Question, StoredExam, StreamId, SubjectExams } from "@/lib/types";

export async function getExam(id: string): Promise<StoredExam | undefined> {
  return (await store()).getExam(id);
}

/** Published exams students can take. */
export async function getPublishedExam(id: string): Promise<StoredExam | undefined> {
  const exam = await getExam(id);
  return exam?.status === "published" ? exam : undefined;
}

export async function listExams(filter?: { level?: Level; stream?: StreamId; publishedOnly?: boolean }): Promise<StoredExam[]> {
  return (await store()).listExams({ level: filter?.level, stream: filter?.stream, status: filter?.publishedOnly ? "published" : undefined });
}

/** Published exams per subject and type, for the subject grid. */
export async function examIndex(level: Level, stream: StreamId) {
  const exams = await listExams({ level, stream, publishedOnly: true });
  const index: Record<string, SubjectExams> = {};
  for (const e of exams) {
    if (!e || !e.subjectId || !e.type) continue;
    const bySubject = (index[e.subjectId] ??= {});
    (bySubject[e.type] ??= []).push({
      id: e.id,
      titleBn: e.titleBn || "",
      questions: e.questions?.length ?? 0,
      durationSec: e.durationSec ?? 0,
      isPaid: Boolean(e.isPaid),
      price: e.price,
    });
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
  showSolutions?: boolean;
  isPaid?: boolean;
  price?: number;
}

export async function createExam(input: ExamMetaInput): Promise<StoredExam> {
  const now = Date.now();
  const exam: StoredExam = { id: newId("exm"), ...input, questions: [], status: "draft", createdAt: now, updatedAt: now };
  await (await store()).insertExam(exam);
  return exam;
}

export async function updateExamMeta(id: string, input: ExamMetaInput): Promise<void> {
  await (await store()).updateExam(id, { ...input, updatedAt: Date.now() });
}

export async function setExamStatus(id: string, status: ExamStatus): Promise<"ok" | "no-questions"> {
  const s = await store();
  const exam = await s.getExam(id);
  if (!exam) return "ok";
  if (status === "published" && exam.questions.length === 0) return "no-questions";
  await s.updateExam(id, { status, updatedAt: Date.now() });
  return "ok";
}

export async function deleteExam(id: string): Promise<"ok" | "has-attempts"> {
  return (await store()).deleteExam(id);
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
  const question: Question = {
    id: newId("q"),
    text: input.text,
    options: (["a", "b", "c", "d"] as const).map((id) => ({ id, text: input.options[id] })),
    correctOptionId: input.correctOptionId,
    explanation: input.explanation,
    topic: input.topic,
    marks: input.marks,
  };
  const s = await store();
  await s.insertQuestion(examId, question);
  await s.updateExam(examId, { updatedAt: Date.now() });
}

export async function deleteQuestion(examId: string, questionId: string): Promise<void> {
  const s = await store();
  const remaining = await s.deleteQuestion(examId, questionId);
  // An exam with no questions can't stay published.
  await s.updateExam(examId, { updatedAt: Date.now(), ...(remaining === 0 ? { status: "draft" as const } : {}) });
}
