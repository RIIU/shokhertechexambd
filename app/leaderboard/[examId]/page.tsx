import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Crown, Medal, Users } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getPublishedExam } from "@/lib/server/exams";
import { examLeaderboard, type LeaderboardRow } from "@/lib/server/leaderboard";
import { LEVELS, STREAMS, findSubject } from "@/lib/data/catalog";
import { cn, formatClock, toBn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "লিডারবোর্ড", robots: { index: false } };

const SHOWN = 100;

/** Ranking for one exam. Signed-in students only: it lists names and institutions. */
export default async function LeaderboardPage({ params }: { params: { examId: string } }) {
  const viewer = await requireUser(`/leaderboard/${params.examId}`);
  const exam = await getPublishedExam(params.examId);
  if (!exam) notFound();

  const rows = await examLeaderboard(exam.id);
  const me = rows.find((r) => r.userId === viewer.id);
  const subject = findSubject(exam.level, exam.stream, exam.subjectId);
  const podium = rows.slice(0, 3);

  return (
    <main className="container max-w-4xl pb-20 pt-8 sm:pt-12">
      <Link href="/live" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        <span lang="bn">লাইভ পরীক্ষা</span>
      </Link>

      <header className="mb-8">
        <p lang="bn" className="mb-1 text-sm text-ink-subtle">
          {subject?.nameBn ?? exam.subjectId} · {LEVELS[exam.level].nameBn} · {STREAMS[exam.stream].nameBn}
        </p>
        <h1 lang="bn" className="mb-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {exam.titleBn}
        </h1>
        <p className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <Users className="h-4 w-4" strokeWidth={1.75} />
          <span lang="bn">{toBn(rows.length)} জন শিক্ষার্থী</span>
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <p lang="bn" className="mb-1 font-semibold text-ink">
            এখনো কেউ জমা দেয়নি
          </p>
          <p lang="bn" className="mb-6 text-sm text-ink-muted">
            প্রথম হয়ে লিডারবোর্ডের শীর্ষে নাম লেখাও।
          </p>
          <Link href={`/exam/${exam.id}`} className="btn-primary">
            <span lang="bn">পরীক্ষা শুরু করো</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <ol className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-4" aria-label="শীর্ষ তিন">
            {([[podium[1], 2], [podium[0], 1], [podium[2], 3]] as const).map(([row, place]) =>
              row ? <PodiumCard key={row.attemptId} row={row} place={place} isMe={row.userId === viewer.id} /> : <li key={place} />,
            )}
          </ol>

          {me && (
            <div className="card mb-4 flex items-center justify-between gap-4 border-brand-400/30 bg-brand-50/60 px-5 py-4">
              <p lang="bn" className="text-sm text-ink-muted">
                তোমার অবস্থান <span className="font-display text-lg font-bold text-ink">#{toBn(me.rank)}</span>
                <span className="text-ink-subtle"> / {toBn(rows.length)}</span>
              </p>
              <Link href={`/results/${me.attemptId}`} className="text-sm font-semibold text-brand-300 hover:underline">
                <span lang="bn">আমার ফলাফল</span>
              </Link>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-surface-soft text-xs text-ink-subtle">
                <tr>
                  <th lang="bn" className="w-16 px-4 py-3 text-left font-medium">
                    র‍্যাংক
                  </th>
                  <th lang="bn" className="px-4 py-3 text-left font-medium">
                    শিক্ষার্থী
                  </th>
                  <th lang="bn" className="px-4 py-3 text-right font-medium">
                    স্কোর
                  </th>
                  <th lang="bn" className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    সময়
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rows.slice(0, SHOWN).map((r) => (
                  <tr key={r.attemptId} className={cn(r.userId === viewer.id ? "bg-brand-50/60" : "hover:bg-surface-soft")}>
                    <td lang="bn" className="px-4 py-3 font-display font-semibold text-ink-muted">
                      {toBn(r.rank)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar row={r} size="sm" />
                        <div className="min-w-0">
                          <p lang="bn" className="truncate font-medium text-ink">
                            {r.name}
                            {r.userId === viewer.id && <span className="ml-1.5 text-xs font-semibold text-brand-300">(তুমি)</span>}
                          </p>
                          {r.institution && (
                            <p lang="bn" className="truncate text-xs text-ink-subtle">
                              {r.institution}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td lang="bn" className="px-4 py-3 text-right font-semibold text-ink">
                      {toBn(r.score)}
                      <span className="font-normal text-ink-subtle">/{toBn(r.totalMarks)}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-right text-ink-muted sm:table-cell">
                      <span lang="bn">{formatClock(r.timeTakenSec)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function Avatar({ row, size }: { row: LeaderboardRow; size: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-14 w-14 text-lg" : "h-8 w-8 text-xs";
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 font-semibold text-brand-200 ring-1 ring-surface-border", cls)}>
      {row.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span lang="bn">{row.name.trim().charAt(0)}</span>
      )}
    </span>
  );
}

function PodiumCard({ row, place, isMe }: { row: LeaderboardRow; place: number; isMe: boolean }) {
  const tone =
    place === 1
      ? { icon: Crown, ring: "ring-amber-400/40", badge: "bg-amber-400 text-white", pad: "pt-7 pb-6" }
      : place === 2
        ? { icon: Medal, ring: "ring-slate-300", badge: "bg-slate-400 text-white", pad: "pt-5 pb-5" }
        : { icon: Medal, ring: "ring-orange-300/60", badge: "bg-orange-400 text-white", pad: "pt-5 pb-5" };
  const Icon = tone.icon;
  return (
    <li className={cn("card relative flex flex-col items-center px-2 text-center ring-1", tone.ring, tone.pad, isMe && "bg-brand-50/60")}>
      <span className={cn("absolute -top-3 flex h-6 min-w-6 items-center justify-center gap-1 rounded-full px-2 text-xs font-bold", tone.badge)}>
        <Icon className="h-3.5 w-3.5" />
        <span lang="bn">{toBn(place)}</span>
      </span>
      <Avatar row={row} size="lg" />
      <p lang="bn" className="mt-3 line-clamp-1 w-full text-sm font-semibold text-ink">
        {row.name}
      </p>
      <p lang="bn" className="font-display text-lg font-bold text-ink">
        {toBn(row.score)}
        <span className="text-sm font-normal text-ink-subtle">/{toBn(row.totalMarks)}</span>
      </p>
      <p className="inline-flex items-center gap-1 text-xs text-ink-subtle">
        <Clock className="h-3 w-3" />
        <span lang="bn">{formatClock(row.timeTakenSec)}</span>
      </p>
    </li>
  );
}
