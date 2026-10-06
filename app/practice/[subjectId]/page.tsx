import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileQuestion, Play, RotateCcw } from "lucide-react";
import { EmptyArt } from "@/components/illustrations/Illustrations";
import { SubjectIcon } from "@/components/subjects/SubjectIcon";
import { ACCENT_STYLES } from "@/lib/accent";
import { getCurrentUser } from "@/lib/server/auth";
import { practiceCatalog } from "@/lib/server/practice";
import { LEVELS, STREAMS, findSubject, isLevel, isStream } from "@/lib/data/catalog";
import { cn, formatMinutesBn, toBn } from "@/lib/utils";
import type { Level, StreamId } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { subjectId: string };
  searchParams: { level?: string; stream?: string };
}

function resolve({ searchParams }: Props, fallback?: { level?: Level; stream?: StreamId }) {
  const level: Level = isLevel(searchParams.level ?? "") ? (searchParams.level as Level) : fallback?.level ?? "ssc";
  const stream: StreamId = isStream(searchParams.stream ?? "") ? (searchParams.stream as StreamId) : fallback?.stream ?? "science";
  return { level, stream };
}

export function generateMetadata(props: Props): Metadata {
  const { level, stream } = resolve(props);
  const subject = findSubject(level, stream, props.params.subjectId);
  return { title: subject ? `${subject.nameBn} প্র্যাকটিস` : "প্র্যাকটিস" };
}

/** One subject's practice sets (chapters), with the viewer's best score on each. */
export default async function SubjectPracticePage(props: Props) {
  const user = await getCurrentUser();
  const { level, stream } = resolve(props, user ?? undefined);
  const entry = (await practiceCatalog(level, stream, user?.id)).find((c) => c.subject.id === props.params.subjectId);
  if (!entry) notFound();
  const { subject, sets } = entry;
  const accent = ACCENT_STYLES[subject.accent];

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <section className="container max-w-4xl pb-20 pt-8 sm:pt-12">
        <Link href={`/practice?level=${level}&stream=${stream}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          <span lang="bn">সব বিষয়</span>
        </Link>

        <header className="mb-8 flex items-center gap-4">
          <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl ring-1", accent.bg, accent.text, accent.ring)}>
            <SubjectIcon icon={subject.icon} className="h-8 w-8" />
          </span>
          <div>
            <p lang="bn" className="text-sm text-ink-subtle">
              {LEVELS[level].nameBn} · {STREAMS[stream].nameBn}
            </p>
            <h1 lang="bn" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {subject.nameBn}
            </h1>
          </div>
        </header>

        {sets.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-surface-border bg-obsidian-800/60 px-6 py-14 text-center">
            <EmptyArt className="mb-4 h-24 w-24" />
            <p lang="bn" className="font-semibold text-ink">
              এই বিষয়ের প্রশ্ন শীঘ্রই আসছে
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {sets.map((s, i) => {
              const started = s.attempts > 0;
              return (
                <li key={s.id}>
                  <Link
                    href={user ? `/exam/${s.id}` : `/login?next=${encodeURIComponent(`/exam/${s.id}`)}`}
                    className="group flex items-center gap-4 rounded-2xl border border-surface-border bg-obsidian-800/70 p-4 transition-all hover:border-brand-400/40 hover:bg-obsidian-800 sm:p-5"
                  >
                    <span
                      lang="bn"
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-base font-bold ring-1",
                        started ? "bg-brand-400/15 text-brand-300 ring-brand-400/30" : "bg-white/5 text-ink-muted ring-white/10",
                      )}
                    >
                      {started ? <CheckCircle2 className="h-5 w-5" /> : toBn(i + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p lang="bn" className="truncate font-semibold text-ink">
                        {s.titleBn}
                      </p>
                      <p lang="bn" className="flex flex-wrap gap-x-4 text-xs text-ink-subtle">
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" /> {toBn(s.questions)}টি প্রশ্ন
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formatMinutesBn(s.durationSec)}
                        </span>
                        {s.best !== undefined && <span className="font-semibold text-brand-300">সেরা {toBn(s.best)}%</span>}
                      </p>
                    </div>
                    <span lang="bn" className="hidden items-center gap-1.5 rounded-xl bg-brand-400 px-3.5 py-2 text-sm font-semibold text-forest transition-transform group-hover:translate-x-0.5 sm:inline-flex">
                      {started ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                      {started ? "আবার" : "শুরু"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
