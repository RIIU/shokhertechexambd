"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import {
  addQuestion,
  createExam,
  deleteExam,
  deleteQuestion,
  setExamStatus,
  updateExamMeta,
  type ExamMetaInput,
  type QuestionInput,
} from "@/lib/server/exams";
import { setUserBlocked } from "@/lib/server/users";
import { EXAM_TYPES, getSubjects, isLevel, isStream } from "@/lib/data/catalog";
import type { ExamType, OptionId } from "@/lib/types";

export interface AdminFormState {
  ok?: number; // bumps on success so forms can reset
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => Number(form.get(key));

function parseExamMeta(form: FormData): { data?: ExamMetaInput; fieldErrors?: AdminFormState["fieldErrors"] } {
  const fieldErrors: NonNullable<AdminFormState["fieldErrors"]> = {};
  const titleBn = str(form, "titleBn");
  const titleEn = str(form, "titleEn");
  const level = str(form, "level");
  const stream = str(form, "stream");
  const subjectId = str(form, "subjectId");
  const type = str(form, "type") as ExamType;
  const minutes = num(form, "minutes");
  const negativeMark = num(form, "negativeMark");
  const maxWarnings = num(form, "maxWarnings");

  if (titleBn.length < 3) fieldErrors.titleBn = "বাংলা শিরোনাম দাও";
  if (!isLevel(level)) fieldErrors.level = "স্তর বেছে নাও";
  if (!isStream(stream)) fieldErrors.stream = "বিভাগ বেছে নাও";
  if (isLevel(level) && isStream(stream) && !getSubjects(level, stream).some((s) => s.id === subjectId)) fieldErrors.subjectId = "বিষয় বেছে নাও";
  if (!EXAM_TYPES.includes(type)) fieldErrors.type = "ধরন বেছে নাও";
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 300) fieldErrors.minutes = "১ থেকে ৩০০ মিনিট";
  if (!Number.isFinite(negativeMark) || negativeMark < 0 || negativeMark > 1) fieldErrors.negativeMark = "০ থেকে ১";
  if (!Number.isInteger(maxWarnings) || maxWarnings < 1 || maxWarnings > 10) fieldErrors.maxWarnings = "১ থেকে ১০";
  if (Object.keys(fieldErrors).length || !isLevel(level) || !isStream(stream)) return { fieldErrors };

  return {
    data: {
      titleBn,
      titleEn: titleEn || titleBn,
      level,
      stream,
      subjectId,
      type,
      durationSec: Math.round(minutes * 60),
      negativeMark,
      maxWarnings,
    },
  };
}

function revalidateExamPages(id?: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/ssc", "layout");
  revalidatePath("/hsc", "layout");
  if (id) revalidatePath(`/exam/${id}`);
}

export async function createExamAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const { data, fieldErrors } = parseExamMeta(form);
  if (!data) return { fieldErrors };
  const exam = await createExam(data);
  revalidateExamPages();
  redirect(`/admin/exams/${exam.id}`);
}

export async function updateExamAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = str(form, "id");
  const { data, fieldErrors } = parseExamMeta(form);
  if (!data) return { fieldErrors };
  await updateExamMeta(id, data);
  revalidateExamPages(id);
  return { ok: Date.now() };
}

export async function setExamStatusAction(form: FormData): Promise<void> {
  await requireAdmin();
  const id = str(form, "id");
  const status = str(form, "status") === "published" ? "published" : "draft";
  await setExamStatus(id, status);
  revalidateExamPages(id);
}

export async function deleteExamAction(form: FormData): Promise<void> {
  await requireAdmin();
  const id = str(form, "id");
  const res = await deleteExam(id);
  revalidateExamPages();
  redirect(res === "ok" ? "/admin/exams" : `/admin/exams/${id}?error=has-attempts`);
}

export async function addQuestionAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const examId = str(form, "examId");
  const fieldErrors: NonNullable<AdminFormState["fieldErrors"]> = {};
  const text = str(form, "text");
  const options = { a: str(form, "a"), b: str(form, "b"), c: str(form, "c"), d: str(form, "d") } as Record<OptionId, string>;
  const correct = str(form, "correct") as OptionId;
  const marks = num(form, "marks");

  if (text.length < 3) fieldErrors.text = "প্রশ্ন লেখো";
  (["a", "b", "c", "d"] as const).forEach((k) => {
    if (!options[k]) fieldErrors[k] = "অপশন লেখো";
  });
  if (!["a", "b", "c", "d"].includes(correct)) fieldErrors.correct = "সঠিক উত্তর বেছে নাও";
  if (!Number.isFinite(marks) || marks <= 0 || marks > 10) fieldErrors.marks = "১ থেকে ১০";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const input: QuestionInput = {
    text,
    options,
    correctOptionId: correct,
    explanation: str(form, "explanation"),
    topic: str(form, "topic") || "সাধারণ",
    marks,
  };
  await addQuestion(examId, input);
  revalidateExamPages(examId);
  return { ok: Date.now() };
}

export async function deleteQuestionAction(form: FormData): Promise<void> {
  await requireAdmin();
  const examId = str(form, "examId");
  await deleteQuestion(examId, str(form, "questionId"));
  revalidateExamPages(examId);
}

export async function setBlockedAction(form: FormData): Promise<void> {
  await requireAdmin();
  await setUserBlocked(str(form, "userId"), str(form, "blocked") === "1");
  revalidatePath("/admin/students");
}
