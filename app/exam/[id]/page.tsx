import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getExam, getPublishedExam } from "@/lib/server/exams";
import { getOpenAttempt, getSubmittedLiveAttempt } from "@/lib/server/attempts";
import { hasAccessToExam } from "@/lib/server/enrollments";
import { getLatestUserPayment } from "@/lib/server/payments";
import { toCandidateExam } from "@/lib/exams/grading";
import { clientIp } from "@/lib/server/request";
import { formatPhone } from "@/lib/phone";
import { LiveExamClient } from "./LiveExamClient";
import { StrictExamClient } from "./StrictExamClient";
import { isStrict } from "@/lib/server/strict-exam";
import { PaidExamGate } from "@/components/exam/PaidExamGate";

// Every attempt is personalised (watermark, server deadline): never cached.
export const dynamic = "force-dynamic";

interface ExamPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  const exam = await getExam(params.id);
  return {
    title: exam ? `${exam.titleEn} · Exam` : "Exam not found",
    robots: { index: false, follow: false },
  };
}

/**
 * Exam route, server half: checks who is sitting the exam, strips the answer
 * key (toCandidateExam) and hands over any attempt already in progress so a
 * refresh resumes the same server-side deadline.
 */
export default async function ExamPage({ params }: ExamPageProps) {
  const user = await requireUser(`/exam/${params.id}`);
  const exam = user.role === "admin" ? await getExam(params.id) : await getPublishedExam(params.id);
  if (!exam || !exam.questions || exam.questions.length === 0) notFound();

  // Check paid exam enrollment access
  const allowed = await hasAccessToExam(exam, user);
  if (!allowed) {
    const latestPayment = await getLatestUserPayment(user.id, exam.id);
    return <PaidExamGate exam={exam} user={user} initialPayment={latestPayment} />;
  }

  if (exam.type === "live") {
    const done = await getSubmittedLiveAttempt(exam.id, user.id);
    if (done) return <AlreadySubmitted attemptId={done.id} title={exam.titleBn} />;
  }

  const open = await getOpenAttempt(exam.id, user.id);
  if (open?.submittedAt) redirect(`/results/${open.id}`);

  const candidate = {
    name: user.name,
    phone: formatPhone(user.phone),
    roll: user.id.slice(-8).toUpperCase(),
    ip: clientIp(),
  };
  const initialAttempt = open
    ? { id: open.id, startedAt: open.startedAt, endsAt: open.endsAt, strikes: open.strikes, serverNow: Date.now() }
    : null;

  // Live and model tests: no question leaves the server before the attempt starts,
  // and then only one at a time (see lib/server/strict-exam.ts).
  if (isStrict(exam)) {
    return (
      <StrictExamClient
        exam={{ ...toCandidateExam(exam), questions: [] }}
        questionCount={exam.questions.length}
        candidate={candidate}
        initialAttempt={initialAttempt}
      />
    );
  }

  return <LiveExamClient exam={toCandidateExam(exam)} candidate={candidate} initialAttempt={initialAttempt} />;
}

function AlreadySubmitted({ attemptId, title }: { attemptId: string; title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-radial-forest p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-brand-400" strokeWidth={1.5} />
        <h1 lang="bn" className="mb-2 text-xl font-bold text-ink">
          তুমি এই লাইভ পরীক্ষা দিয়ে ফেলেছ
        </h1>
        <p lang="bn" className="mb-6 text-sm text-ink-muted">
          {title}: লাইভ পরীক্ষা একবারই দেওয়া যায়।
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard" className="btn-ghost">
            <span lang="bn">ড্যাশবোর্ড</span>
          </Link>
          <Link href={`/results/${attemptId}`} className="btn-primary">
            <span lang="bn">ফলাফল দেখো</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
