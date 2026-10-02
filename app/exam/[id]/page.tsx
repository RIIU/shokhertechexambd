import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getExam, toCandidateExam } from "@/lib/exams/repository";
import { LiveExamClient, type Candidate } from "./LiveExamClient";

// Every attempt is personalised (watermark IP, fresh data): never statically cached.
export const dynamic = "force-dynamic";

interface ExamPageProps {
  params: { id: string };
}

export function generateMetadata({ params }: ExamPageProps): Metadata {
  const exam = getExam(params.id);
  return {
    title: exam ? `${exam.titleEn} · Live Exam` : "Exam not found",
    robots: { index: false, follow: false },
  };
}

/**
 * Live Exam route.
 *
 * Server half: loads the exam, strips the answer key (toCandidateExam) and
 * resolves who is sitting it (for the watermark). Everything interactive
 * lives in LiveExamClient.
 */
export default function ExamPage({ params }: ExamPageProps) {
  const exam = getExam(params.id);
  if (!exam) notFound();

  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";

  // TODO(auth): replace with the signed-in student from the session.
  const candidate: Candidate = {
    name: "Demo Student",
    phone: "01712-345678",
    roll: "SSC-26-004217",
    ip,
  };

  return <LiveExamClient exam={toCandidateExam(exam)} candidate={candidate} />;
}
