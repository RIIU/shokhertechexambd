import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, CircleDollarSign, ListChecks, Timer, type LucideIcon } from "lucide-react";
import { EXAM_TYPE_META } from "@/lib/data/catalog";
import { cn, formatMinutesBn, toBn } from "@/lib/utils";
import type { LandingExam } from "@/lib/server/landing";

const priority = (e: LandingExam) => (e.type === "live" ? 0 : e.type === "model" ? 1 : 2);

function Pill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-obsidian-800 px-2.5 py-1 text-xs text-ink-muted">
      <Icon className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
      {children}
    </span>
  );
}

export function LiveExamTicker({ exams }: { exams: LandingExam[] }) {
  const shown = [...exams].sort((a, b) => priority(a) - priority(b)).slice(0, 8);

  return (
    <section id="live-exams" className="bg-section py-24" aria-labelledby="live-exams-title">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="chip mb-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              <span lang="bn">চলমান পরীক্ষা</span>
            </span>
            <h2 id="live-exams-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
              আজই <span className="text-gradient">দেমে দেখো</span>
            </h2>
            <p lang="bn" className="mt-3 text-ink-muted">
              সব পরীক্ষাই এখন সম্পূর্ণ ফ্রি। জমা দিলেই সাথে সাথে রেজাল্ট ও র‍্যাংক।
            </p>
          </div>
          <Link href="/register" className="btn-ghost px-5 py-2.5">
            <span lang="bn">ফ্রি অ্যাকাউন্ট খোলো</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        {shown.length === 0 ? (
          <p lang="bn" className="rounded-3xl border border-surface-border bg-obsidian-900 p-8 text-center text-ink-muted">
            এখনো কোনো পরীক্ষা প্রকাশ করা হয়নি। নতুন পরীক্ষা আসছে — চোখ রাখো।
          </p>
        ) : (
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
            {shown.map((e) => (
              <li key={e.id} className="w-[85vw] shrink-0 snap-start sm:w-[22rem] md:w-auto">
                <Link
                  href={`/exam/${e.id}`}
                  className={cn(
                    "group flex h-full flex-col rounded-3xl border border-surface-border bg-obsidian-900 p-5 shadow-card",
                    "transition-all duration-300 hover:border-brand-400/25 hover:shadow-glow",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span lang="bn" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
                      {EXAM_TYPE_META[e.type].nameBn}
                    </span>
                    <span
                      lang="bn"
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold",
                        e.isPaid ? "bg-amber-400/15 text-amber-200" : "bg-leaf-400/15 text-leaf-300",
                      )}
                    >
                      {e.isPaid ? (
                        <>
                          <CircleDollarSign className="h-3 w-3" strokeWidth={1.5} />
                          ৳{toBn(e.price)}
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" strokeWidth={2} />
                          ফ্রি
                        </>
                      )}
                    </span>
                  </div>

                  <h3 lang="bn" className="mb-2 font-semibold leading-snug text-ink group-hover:text-brand-200">
                    {e.titleBn}
                  </h3>
                  <p lang="bn" className="mb-4 text-xs text-ink-subtle">
                    {e.levelName} · {e.streamName} · {e.subjectName}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Pill icon={Timer}>{formatMinutesBn(e.durationMin * 60)}</Pill>
                    <Pill icon={ListChecks}>{toBn(e.questionCount)} প্রশ্ন</Pill>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
