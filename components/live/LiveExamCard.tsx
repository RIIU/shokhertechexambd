import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, Clock, FileQuestion, Lock, MinusCircle, Trophy, Users } from "lucide-react";
import { InlineCountdown } from "./Countdown";
import { formatBdTime, liveState } from "@/lib/live-window";
import { SubjectIcon } from "@/components/subjects/SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { LEVELS, STREAMS } from "@/lib/data/catalog";
import { cn, formatMinutesBn, toBn } from "@/lib/utils";
import type { Subject, StoredExam } from "@/lib/types";

export interface LiveExamCardProps {
  exam: StoredExam;
  subject?: Subject;
  participants: number;
  topScore?: number;
  /** The viewer's graded attempt, if they already sat this exam. */
  mine?: { attemptId: string; score: number; rank: number };
  signedIn: boolean;
}

/** One live exam: what it is, how many sat it, and the next step for the viewer. */
export function LiveExamCard({ exam, subject, participants, topScore, mine, signedIn }: LiveExamCardProps) {
  const accent = ACCENT_STYLES[subject?.accent ?? "brand"];
  const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);
  const state = liveState(exam);

  return (
    <article className="group card flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", accent.bg, accent.text, accent.ring)}>
            <SubjectIcon icon={subject?.icon ?? "book"} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p lang="bn" className="truncate text-sm font-semibold text-ink">
              {subject?.nameBn ?? exam.subjectId}
            </p>
            <p lang="bn" className="truncate text-xs text-ink-subtle">
              {LEVELS[exam.level].nameBn} · {STREAMS[exam.stream].nameBn}
            </p>
          </div>
        </div>
        {mine ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-400/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200 ring-1 ring-brand-400/15">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span lang="bn">দিয়েছ</span>
          </span>
        ) : state === "upcoming" && exam.startsAt ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/25">
            <CalendarClock className="h-3.5 w-3.5" />
            <InlineCountdown to={exam.startsAt} refresh />
          </span>
        ) : state === "closed" ? (
          <span lang="bn" className="inline-flex shrink-0 items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-ink-muted ring-1 ring-white/10">
            শেষ হয়েছে
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300 ring-1 ring-rose-500/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            <span lang="bn">লাইভ</span>
          </span>
        )}
      </header>

      <h3 lang="bn" className={cn("line-clamp-2 text-lg font-bold leading-snug text-ink", exam.startsAt || exam.closesAt ? "mb-1" : "mb-4")}>
        {exam.titleBn}
      </h3>
      {(exam.startsAt || exam.closesAt) && (
        <p lang="bn" className="mb-4 text-xs text-ink-subtle">
          {exam.startsAt && <>শুরু {formatBdTime(exam.startsAt)}</>}
          {exam.startsAt && exam.closesAt && " · "}
          {exam.closesAt && <>শেষ {formatBdTime(exam.closesAt)}</>}
        </p>
      )}

      <dl className="mb-5 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: FileQuestion, label: "প্রশ্ন", value: toBn(exam.questions.length) },
          { icon: Clock, label: "সময়", value: formatMinutesBn(exam.durationSec) },
          { icon: MinusCircle, label: "নেগেটিভ", value: exam.negativeMark ? toBn(exam.negativeMark) : "নেই" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-surface-soft px-2 py-2.5 ring-1 ring-surface-border">
            <dt className="mb-0.5 flex items-center justify-center gap-1 text-[11px] text-ink-subtle">
              <Icon className="h-3 w-3" strokeWidth={1.75} />
              <span lang="bn">{label}</span>
            </dt>
            <dd lang="bn" className="text-sm font-semibold text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span lang="bn">{participants ? `${toBn(participants)} জন অংশ নিয়েছে` : "প্রথম অংশগ্রহণকারী হও"}</span>
        </span>
        {topScore !== undefined && participants > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.75} />
            <span lang="bn">
              সর্বোচ্চ {toBn(topScore)}/{toBn(totalMarks)}
            </span>
          </span>
        )}
        {exam.isPaid && (
          <span lang="bn" className="rounded-md bg-amber-400/10 px-1.5 py-0.5 font-semibold text-amber-300 ring-1 ring-amber-500/20">
            ৳{toBn(exam.price ?? 50)}
          </span>
        )}
      </div>

      <footer className="mt-auto flex items-center gap-2 border-t border-surface-border pt-4">
        {mine ? (
          <>
            <div className="min-w-0 flex-1">
              <p lang="bn" className="text-xs text-ink-subtle">
                তোমার স্কোর · র‍্যাংক
              </p>
              <p lang="bn" className="font-display text-base font-bold text-ink">
                {toBn(mine.score)}/{toBn(totalMarks)} <span className="text-ink-subtle">·</span> #{toBn(mine.rank)}
              </p>
            </div>
            <Link href={`/results/${mine.attemptId}`} className="btn-primary px-4 py-2">
              <span lang="bn">ফলাফল</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : state === "upcoming" ? (
          <Link href={`/exam/${exam.id}`} className="btn-ghost flex-1 py-2.5">
            <Lock className="h-4 w-4" />
            <span lang="bn">অপেক্ষা কক্ষে যাও</span>
          </Link>
        ) : state === "closed" ? (
          <Link href={`/leaderboard/${exam.id}`} className="btn-ghost flex-1 py-2.5">
            <Trophy className="h-4 w-4" />
            <span lang="bn">চূড়ান্ত র‍্যাংক দেখো</span>
          </Link>
        ) : (
          <Link
            href={signedIn ? `/exam/${exam.id}` : `/login?next=${encodeURIComponent(`/exam/${exam.id}`)}`}
            className="btn-primary flex-1 py-2.5"
          >
            <span lang="bn">পরীক্ষা শুরু করো</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href={`/leaderboard/${exam.id}`}
          aria-label="লিডারবোর্ড"
          title="লিডারবোর্ড"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-obsidian-900 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <Trophy className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </footer>
    </article>
  );
}
