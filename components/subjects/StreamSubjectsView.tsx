import Link from "next/link";
import { ChevronRight, Layers, Radio, Sparkles } from "lucide-react";
import { GsapReveal } from "@/components/ui/GsapReveal";
import { SubjectGrid } from "./SubjectGrid";
import { LEVELS, STREAMS, STREAM_IDS, getSubjects } from "@/lib/data/catalog";
import { examIndex } from "@/lib/server/exams";
import { cn, toBn } from "@/lib/utils";
import type { Level, StreamId } from "@/lib/types";

interface StreamSubjectsViewProps {
  level: Level;
  stream: StreamId;
}

/** Stream landing: hero, stream switcher, stats and the animated subject grid. */
export async function StreamSubjectsView({ level, stream }: StreamSubjectsViewProps) {
  const lvl = LEVELS[level];
  const str = STREAMS[stream];
  const index = await examIndex(level, stream);
  const subjects = getSubjects(level, stream).map((s) => ({ ...s, available: index[s.id] }));
  const totalExams = Object.values(index).reduce((sum, byType) => sum + Object.values(byType).reduce((n, l) => n + (l?.length ?? 0), 0), 0);
  const liveNow = subjects.filter((s) => s.available?.live?.length).length;

  const stats = [
    { icon: Layers, label: "বিষয়", value: toBn(subjects.length) },
    { icon: Sparkles, label: "মোট পরীক্ষা", value: toBn(totalExams) },
    { icon: Radio, label: "এখন লাইভ", value: toBn(liveNow) },
  ];

  return (
    <main className="relative overflow-x-clip">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-radial-brand" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-96 w-96 rounded-full bg-radial-glow blur-2xl" />

      <section className="container pb-10 pt-10 sm:pt-16">
        <GsapReveal>
          <nav data-reveal aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted">
            <Link href="/" lang="bn" className="hover:text-ink">
              হোম
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${level}`} lang="bn" className="hover:text-ink">
              {lvl.nameBn}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span lang="bn" className="text-ink">
              {str.nameBn}
            </span>
          </nav>

          <span data-reveal className="chip mb-5 border-brand-400/30 text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-glow-sm" />
            {lvl.nameEn} · {str.nameEn}
          </span>

          <h1 data-reveal lang="bn" className="mb-4 text-4xl font-bold leading-tight sm:text-6xl">
            <span className="text-ink">{lvl.nameBn} </span>
            <span className="text-gradient">{str.nameBn}</span>
          </h1>
          <p data-reveal lang="bn" className="mb-8 max-w-2xl text-lg text-ink-muted">
            {str.taglineBn}। যেকোনো বিষয় বেছে নাও, তারপর অনুশীলন, মডেল টেস্ট বা লাইভ পরীক্ষা শুরু করো।
          </p>

          {/* Level & Stream Switcher */}
          <div data-reveal className="mb-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold mr-1">স্তর:</span>
              <div className="glass inline-flex rounded-xl p-1">
                {(["ssc", "hsc"] as const).map((l) => (
                  <Link
                    key={l}
                    href={`/${l}/${stream}`}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all",
                      l === level ? "bg-brand-400 text-forest shadow-glow-sm" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <span lang="bn">{LEVELS[l].nameBn}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold mr-1">বিভাগ:</span>
              <div className="flex flex-wrap gap-2">
                {STREAM_IDS.map((id) => (
                  <Link
                    key={id}
                    href={`/${level}/${id}`}
                    aria-current={id === stream ? "page" : undefined}
                    className={cn(
                      "rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all",
                      id === stream
                        ? "border-brand-400/50 bg-brand-400/10 text-brand-200 shadow-glow-sm font-bold"
                        : "border-white/10 text-ink-muted hover:border-white/20 hover:text-ink",
                    )}
                  >
                    <span lang="bn">{STREAMS[id].nameBn}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <dl data-reveal className="grid max-w-xl grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
                  <span lang="bn">{label}</span>
                </dt>
                <dd lang="bn" className="font-display text-2xl font-bold text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </GsapReveal>
      </section>

      <section className="container" aria-label="Subjects">
        <SubjectGrid subjects={subjects} level={level} stream={stream} />
      </section>
    </main>
  );
}
