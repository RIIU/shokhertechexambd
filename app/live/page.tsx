import type { Metadata } from "next";
import Link from "next/link";
import { Radio, Trophy, Users } from "lucide-react";
import { LiveExamCard } from "@/components/live/LiveExamCard";
import { getCurrentUser } from "@/lib/server/auth";
import { listAttempts, rankFrom, scoresByExam } from "@/lib/server/attempts";
import { listExams } from "@/lib/server/exams";
import { LEVELS, findSubject, isLevel } from "@/lib/data/catalog";
import { cn, toBn } from "@/lib/utils";
import type { Level } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "লাইভ পরীক্ষা",
  description: "সারা দেশের এসএসসি ও এইচএসসি শিক্ষার্থীদের সাথে একই প্রশ্নে লাইভ পরীক্ষা দাও, সাথে সাথে র‍্যাংক আর বিশ্লেষণ দেখো।",
};

const FILTERS: { key: Level | "all"; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "ssc", label: LEVELS.ssc.nameBn },
  { key: "hsc", label: LEVELS.hsc.nameBn },
];

export default async function LivePage({ searchParams }: { searchParams: { level?: string } }) {
  const user = await getCurrentUser();
  // Students land on their own level first; anyone can switch.
  const requested = searchParams.level;
  const level: Level | "all" =
    requested === "all" ? "all" : requested && isLevel(requested) ? requested : user?.role === "student" && user.level ? user.level : "all";

  const all = (await listExams({ publishedOnly: true })).filter((e) => e.type === "live");
  const exams = level === "all" ? all : all.filter((e) => e.level === level);

  const scores = await scoresByExam(all.map((e) => e.id));
  const mine = new Map<string, { attemptId: string; score: number; rank: number }>();
  if (user) {
    for (const a of await listAttempts({ userId: user.id, submittedOnly: true })) {
      if (!a.result || mine.has(a.examId)) continue; // newest first
      mine.set(a.examId, { attemptId: a.id, score: a.result.score, ...rankFrom(scores.get(a.examId), a.result.score) });
    }
  }

  // Not yet taken first, then the most popular.
  const ordered = [...exams].sort(
    (a, b) => Number(mine.has(a.id)) - Number(mine.has(b.id)) || (scores.get(b.id)?.length ?? 0) - (scores.get(a.id)?.length ?? 0),
  );
  const totalParticipants = all.reduce((n, e) => n + (scores.get(e.id)?.length ?? 0), 0);

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <section className="container pb-8 pt-10 sm:pt-14">
        <span className="chip mb-5 border-rose-500/20 bg-rose-50 text-rose-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <span lang="bn">এখন চলছে</span>
        </span>
        <h1 lang="bn" className="mb-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          লাইভ পরীক্ষা
        </h1>
        <p lang="bn" className="mb-8 max-w-2xl text-lg text-ink-muted">
          সারা দেশের শিক্ষার্থীদের সাথে একই প্রশ্নে পরীক্ষা দাও। জমা দেওয়ার সাথে সাথে স্কোর, র‍্যাংক আর বিস্তারিত বিশ্লেষণ।
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="স্তর" className="inline-flex self-start rounded-xl bg-surface-hover p-1">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/live?level=${f.key}`}
                aria-current={f.key === level ? "page" : undefined}
                lang="bn"
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  f.key === level ? "bg-white text-ink shadow-card ring-1 ring-surface-border" : "text-ink-muted hover:text-ink",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <dl className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose-500" strokeWidth={1.75} />
              <dt lang="bn" className="text-ink-muted">
                লাইভ পরীক্ষা
              </dt>
              <dd lang="bn" className="font-semibold text-ink">
                {toBn(all.length)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-400" strokeWidth={1.75} />
              <dt lang="bn" className="text-ink-muted">
                মোট অংশগ্রহণ
              </dt>
              <dd lang="bn" className="font-semibold text-ink">
                {toBn(totalParticipants)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container pb-20" aria-label="লাইভ পরীক্ষার তালিকা">
        {ordered.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((exam) => {
              const s = scores.get(exam.id) ?? [];
              return (
                <li key={exam.id}>
                  <LiveExamCard
                    exam={exam}
                    subject={findSubject(exam.level, exam.stream, exam.subjectId)}
                    participants={s.length}
                    topScore={s.length ? Math.max(...s) : undefined}
                    mine={mine.get(exam.id)}
                    signedIn={Boolean(user)}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-hover text-ink-subtle">
              <Trophy className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p lang="bn" className="mb-1 font-semibold text-ink">
              এই মুহূর্তে কোনো লাইভ পরীক্ষা নেই
            </p>
            <p lang="bn" className="mb-6 text-sm text-ink-muted">
              নতুন লাইভ পরীক্ষা এলে এখানে দেখাবে। ততক্ষণ অনুশীলন চালিয়ে যাও।
            </p>
            <Link href="/subjects" className="btn-ghost">
              <span lang="bn">বিষয়ভিত্তিক অনুশীলন</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
