import type { Metadata } from "next";
import type { StoredExam } from "@/lib/types";
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
import { PracticeClient } from "./PracticeClient";
import { StrictExamClient } from "./StrictExamClient";
import { findSubject } from "@/lib/data/catalog";
import { BigCountdown } from "@/components/live/Countdown";
import { LiveArt } from "@/components/illustrations/Illustrations";
import { formatBdTime, liveState } from "@/lib/live-window";
import { formatMinutesBn, toBn } from "@/lib/utils";
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
    const { questions, ...meta } = exam;
    return <PaidExamGate exam={{ ...meta, questionCount: questions.length }} user={user} initialPayment={latestPayment} />;
  }

  if (exam.type === "live") {
    const done = await getSubmittedLiveAttempt(exam.id, user.id);
    if (done) return <AlreadySubmitted attemptId={done.id} title={exam.titleBn} />;
  }

  const open = await getOpenAttempt(exam.id, user.id);
  if (open?.submittedAt) redirect(`/results/${open.id}`);

  // Scheduled live exams: waiting room before the start, closed after the end (admins can always test).
  const state = liveState(exam);
  if (!open && user.role !== "admin" && state !== "open") {
    return <LiveGate exam={exam} state={state} />;
  }

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

  // Practice and archive: relaxed, one question at a time with instant feedback.
  return (
    <PracticeClient
      exam={{ ...toCandidateExam(exam), questions: [] }}
      questionCount={exam.questions.length}
      subjectBn={findSubject(exam.level, exam.stream, exam.subjectId)?.nameBn}
      initialAttempt={initialAttempt}
    />
  );
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

function LiveGate({ exam, state }: { exam: StoredExam; state: "upcoming" | "closed" }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-4xl border border-surface-border bg-radial-forest p-6 text-center shadow-card sm:p-10">
        <LiveArt className="mx-auto mb-4 h-24 w-24" />
        <p lang="bn" className="mb-1 text-sm font-semibold text-rose-300">
          {state === "upcoming" ? "লাইভ পরীক্ষা শীঘ্রই শুরু হবে" : "লাইভ পরীক্ষা শেষ হয়েছে"}
        </p>
        <h1 lang="bn" className="mb-2 text-2xl font-bold text-ink">
          {exam.titleBn}
        </h1>
        <p lang="bn" className="mb-6 text-sm text-ink-muted">
          {toBn(exam.questions.length)}টি প্রশ্ন · {formatMinutesBn(exam.durationSec)}
          {exam.startsAt && <> · শুরু {formatBdTime(exam.startsAt)}</>}
          {exam.closesAt && <> · শেষ {formatBdTime(exam.closesAt)}</>}
        </p>
        {state === "upcoming" && exam.startsAt ? (
          <>
            <BigCountdown to={exam.startsAt} />
            <p lang="bn" className="mt-5 text-xs text-ink-subtle">
              সময় হলে এই পাতা নিজে থেকেই খুলে যাবে। পাতাটি খোলা রাখো।
            </p>
          </>
        ) : (
          <div className="flex justify-center gap-3">
            <Link href="/live" className="btn-ghost">
              <span lang="bn">অন্য লাইভ পরীক্ষা</span>
            </Link>
            <Link href={`/leaderboard/${exam.id}`} className="btn-primary">
              <span lang="bn">লিডারবোর্ড দেখো</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
