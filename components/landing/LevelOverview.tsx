import { GsapReveal } from "@/components/ui/GsapReveal";
import { StreamCards } from "./StreamCards";
import { LEVELS } from "@/lib/data/catalog";
import type { Level } from "@/lib/types";

/** /ssc and /hsc: pick a stream. */
export function LevelOverview({ level }: { level: Level }) {
  const lvl = LEVELS[level];
  return (
    <main className="relative overflow-x-clip">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-radial-brand" />
      <section className="container pb-12 pt-12 text-center sm:pt-20">
        <GsapReveal>
          <span data-reveal className="chip mb-5 border-brand-400/30 text-brand-300">
            {lvl.nameEn} Exam System
          </span>
          <h1 data-reveal lang="bn" className="mb-4 text-4xl font-bold sm:text-6xl">
            <span className="text-gradient">{lvl.nameBn}</span> <span className="text-ink">প্রস্তুতি</span>
          </h1>
          <p data-reveal lang="bn" className="mx-auto max-w-xl text-lg text-ink-muted">
            {lvl.fullBn}। তোমার বিভাগ বেছে নাও।
          </p>
        </GsapReveal>
      </section>
      <section className="container">
        <StreamCards level={level} />
      </section>
    </main>
  );
}
