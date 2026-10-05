import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LiveExamCard } from "./LiveExamCard";
import { getCurrentUser } from "@/lib/server/auth";
import { listAttempts, rankFrom, scoresByExam } from "@/lib/server/attempts";
import { listExams } from "@/lib/server/exams";
import { classifyError } from "@/lib/server/diagnose";
import { findSubject } from "@/lib/data/catalog";
import { LIVE_EXAM_HREF } from "@/lib/routes";

/** Home page strip with the most popular live exams. Renders nothing if there are none or the database is down. */
export async function LiveHighlights() {
  let data;
  try {
    const user = await getCurrentUser();
    const exams = (await listExams({ publishedOnly: true })).filter((e) => e.type === "live");
    if (!exams.length) return null;
    const scores = await scoresByExam(exams.map((e) => e.id));
    const attempts = user ? await listAttempts({ userId: user.id, submittedOnly: true }) : [];
    const shown = [...exams]
      .filter((e) => !user || user.role !== "student" || !user.level || e.level === user.level)
      .sort((a, b) => (scores.get(b.id)?.length ?? 0) - (scores.get(a.id)?.length ?? 0))
      .slice(0, 3);
    data = { user, scores, attempts, shown };
  } catch (err) {
    console.error(`[home/live] ${classifyError(err)}`, err);
    return null;
  }
  const { user, scores, attempts, shown } = data;
  if (!shown.length) return null;

  return (
    <section className="container py-14 sm:py-16" aria-labelledby="live-title">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span lang="bn">এখন চলছে</span>
          </p>
          <h2 id="live-title" lang="bn" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            লাইভ পরীক্ষা
          </h2>
        </div>
        <Link href={LIVE_EXAM_HREF} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline">
          <span lang="bn">সব দেখো</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((exam) => {
          const s = scores.get(exam.id) ?? [];
          const a = attempts.find((x) => x.examId === exam.id && x.result);
          return (
            <li key={exam.id}>
              <LiveExamCard
                exam={exam}
                subject={findSubject(exam.level, exam.stream, exam.subjectId)}
                participants={s.length}
                topScore={s.length ? Math.max(...s) : undefined}
                mine={a?.result ? { attemptId: a.id, score: a.result.score, ...rankFrom(s, a.result.score) } : undefined}
                signedIn={Boolean(user)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
