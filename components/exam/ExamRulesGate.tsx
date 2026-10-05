"use client";

import { motion } from "framer-motion";
import { Clock, Copy, Eye, Loader2, Maximize, MonitorX, ShieldCheck, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatMinutesBn, toBn } from "@/lib/utils";
import type { CandidateExam } from "@/lib/types";

interface ExamRulesGateProps {
  exam: CandidateExam;
  resuming: boolean;
  starting?: boolean;
  error?: string | null;
  onStart: () => void;
}

/** Pre-exam briefing. The start click doubles as the user gesture fullscreen requires. */
export function ExamRulesGate({ exam, resuming, starting, error, onStart }: ExamRulesGateProps) {
  const rules: { icon: LucideIcon; text: string }[] = [
    { icon: Maximize, text: "পরীক্ষা ফুলস্ক্রিন মোডে চলবে। ফুলস্ক্রিন থেকে বের হলে সতর্কতা দেওয়া হবে।" },
    {
      icon: MonitorX,
      text: `অন্য ট্যাব বা অ্যাপে গেলে সতর্কতা দেওয়া হবে। ${toBn(exam.maxWarnings)}টি সতর্কতার পর পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হবে।`,
    },
    { icon: Copy, text: "কপি, পেস্ট, রাইট-ক্লিক ও ডেভেলপার টুলস বন্ধ থাকবে।" },
    { icon: Eye, text: "স্ক্রিনে তোমার ফোন নম্বর ও আইপি সহ ওয়াটারমার্ক থাকবে।" },
    { icon: Clock, text: "সময় শেষ হলে উত্তর স্বয়ংক্রিয়ভাবে জমা হবে। পেজ রিফ্রেশ করলেও সময় থামবে না।" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="page-backdrop" />
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border-animated w-full max-w-2xl rounded-4xl p-6 animate-border-spin sm:p-10"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400/10 ring-1 ring-brand-400/30">
            <ShieldCheck className="h-6 w-6 text-brand-400" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">Strict Mode</p>
            <h1 lang="bn" className="text-2xl font-bold text-ink sm:text-3xl">
              {exam.titleBn}
            </h1>
          </div>
        </div>

        <dl className="mb-8 grid grid-cols-3 gap-3">
          {[
            { k: "প্রশ্ন", v: toBn(exam.questions?.length ?? 0) },
            { k: "পূর্ণমান", v: toBn(exam.totalMarks) },
            { k: "সময়", v: formatMinutesBn(exam.durationSec) },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-surface-border bg-white/[0.02] p-3 text-center">
              <dt lang="bn" className="text-xs text-ink-muted">
                {s.k}
              </dt>
              <dd lang="bn" className="font-display text-lg font-bold text-ink">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>

        <h2 lang="bn" className="mb-3 text-sm font-semibold text-ink">
          পরীক্ষার নিয়মাবলি
        </h2>
        <ul className="mb-8 space-y-2.5">
          {rules.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="flex items-start gap-3 rounded-xl border border-surface-border bg-white/[0.015] p-3"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf-300" strokeWidth={1.5} />
              <span lang="bn" className="text-sm text-ink-muted">
                {text}
              </span>
            </motion.li>
          ))}
        </ul>

        {exam.negativeMark > 0 && (
          <p lang="bn" className="mb-6 rounded-xl bg-state-danger/10 p-3 text-center text-sm text-rose-200 ring-1 ring-state-danger/25">
            প্রতিটি ভুল উত্তরের জন্য {toBn(exam.negativeMark)} নম্বর কাটা যাবে।
          </p>
        )}

        {error && (
          <p lang="bn" role="alert" className="mb-4 rounded-xl bg-state-danger/10 p-3 text-center text-sm text-rose-200 ring-1 ring-state-danger/30">
            {error}
          </p>
        )}

        <button type="button" onClick={onStart} disabled={starting} className="btn-primary w-full py-3.5 text-base">
          {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" strokeWidth={1.5} />}
          <span lang="bn">{resuming ? "পরীক্ষা চালিয়ে যাও" : "নিয়ম মেনে পরীক্ষা শুরু করো"}</span>
        </button>
      </motion.section>
    </div>
  );
}
