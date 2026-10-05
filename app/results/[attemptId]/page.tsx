import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultView } from "@/components/result/ResultView";
import { requireUser } from "@/lib/server/auth";
import { getResult } from "@/lib/server/attempts";
import { getExam } from "@/lib/server/exams";
import { getUser } from "@/lib/server/users";
import { sharePath } from "@/lib/server/share";
import { EXAM_TYPE_META, LEVELS, STREAMS, findSubject } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Result", robots: { index: false } };

/** A graded attempt. Visible to the student who sat it and to admins. Rank is computed live. */
export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const viewer = await requireUser(`/results/${params.attemptId}`);
  const data = await getResult(params.attemptId);
  if (!data) notFound();
  const isOwner = data.attempt.userId === viewer.id;
  if (!isOwner && viewer.role !== "admin") notFound();

  const exam = await getExam(data.attempt.examId);
  const student = isOwner ? undefined : await getUser(data.attempt.userId);

  // Admins always see solutions. Students see solutions unless showSolutions is disabled.
  const showSolutions = viewer.role === "admin" || exam?.showSolutions !== false;

  const result = showSolutions
    ? { ...data.result, showSolutions: true }
    : {
        ...data.result,
        showSolutions: false,
        questions: data.result.questions.map((q) => ({
          ...q,
          correctOptionId: "" as any,
          explanation: "",
        })),
      };

  return (
    <ResultView
      result={result}
      meta={
        exam
          ? {
              subjectBn: findSubject(exam.level, exam.stream, exam.subjectId)?.nameBn,
              levelBn: LEVELS[exam.level].nameBn,
              streamBn: STREAMS[exam.stream].nameBn,
              typeBn: EXAM_TYPE_META[exam.type].nameBn,
              negativeMark: exam.negativeMark,
            }
          : undefined
      }
      sharePath={isOwner ? sharePath(data.attempt.id) : undefined}
      sharer={isOwner ? { name: viewer.name, institution: viewer.institution } : undefined}
      leaderboardHref={exam?.status === "published" ? `/leaderboard/${exam.id}` : undefined}
      showSolutions={showSolutions}
      canRetake={isOwner && exam?.status === "published" && exam.type !== "live"}
      studentName={student?.name}
      backHref={isOwner ? "/dashboard" : "/admin/attempts"}
      backLabel={isOwner ? "ড্যাশবোর্ডে ফিরে যাও" : "সব ফলাফল"}
    />
  );
}
