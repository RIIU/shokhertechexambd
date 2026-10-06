import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { EmptyArt, MistakesArt } from "@/components/illustrations/Illustrations";
import { requireUser } from "@/lib/server/auth";
import { recentMistakes } from "@/lib/server/practice";
import { OPTION_LABEL_BN, cn, formatDateBn, toBn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ভুলগুলো আবার দেখো", robots: { index: false } };

/** The student's recent wrong answers with the right one and the explanation. */
export default async function MistakesPage() {
  const user = await requireUser("/practice/mistakes");
  const mistakes = await recentMistakes(user.id);

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <section className="container max-w-3xl pb-20 pt-8 sm:pt-12">
        <Link href="/practice" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          <span lang="bn">প্রশ্ন ব্যাংক</span>
        </Link>
        <header className="mb-8 flex items-center gap-4">
          <MistakesArt className="h-20 w-20 shrink-0" />
          <div>
            <h1 lang="bn" className="text-3xl font-bold tracking-tight text-ink">
              ভুলগুলো আবার দেখো
            </h1>
            <p lang="bn" className="text-ink-muted">
              যেখানে ভুল হয়েছিল, সেখান থেকেই শেখা শুরু। পরে সঠিক করলে প্রশ্নটি এখান থেকে সরে যাবে।
            </p>
          </div>
        </header>

        {mistakes.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-surface-border bg-obsidian-800/60 px-6 py-14 text-center">
            <EmptyArt className="mb-4 h-24 w-24" />
            <p lang="bn" className="mb-1 font-semibold text-ink">
              কোনো ভুল জমা নেই
            </p>
            <p lang="bn" className="mb-6 text-sm text-ink-muted">
              প্র্যাকটিস বা পরীক্ষা দিলে ভুল প্রশ্নগুলো এখানে দেখাবে।
            </p>
            <Link href="/practice" className="btn-primary">
              <span lang="bn">প্র্যাকটিস শুরু করো</span>
            </Link>
          </div>
        ) : (
          <ol className="space-y-4">
            {mistakes.map((m) => (
              <li key={`${m.examId}:${m.questionId}`} className="rounded-3xl border border-surface-border bg-obsidian-800/70 p-5 sm:p-6">
                <p lang="bn" className="mb-2 text-xs text-ink-subtle">
                  {m.examTitle} · {m.topic} · {formatDateBn(m.at)}
                </p>
                <p lang="bn" className="mb-4 font-semibold text-ink">
                  {m.text}
                </p>
                <ul className="mb-4 grid gap-2 sm:grid-cols-2">
                  {m.options.map((o) => {
                    const right = o.id === m.correct;
                    const yours = o.id === m.yours;
                    return (
                      <li
                        key={o.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-sm",
                          right ? "border-brand-400/60 bg-brand-400/10 text-ink" : yours ? "border-state-danger/60 bg-state-danger/10 text-ink" : "border-surface-border text-ink-muted",
                        )}
                      >
                        <span lang="bn" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 text-xs font-bold">
                          {OPTION_LABEL_BN[o.id]}
                        </span>
                        <span lang="bn" className="flex-1">
                          {o.text}
                        </span>
                        {right && <CheckCircle2 className="h-4 w-4 text-brand-400" aria-label="সঠিক উত্তর" />}
                        {yours && !right && <XCircle className="h-4 w-4 text-rose-400" aria-label="তোমার উত্তর" />}
                      </li>
                    );
                  })}
                </ul>
                {m.explanation ? (
                  <div className="flex gap-3 rounded-2xl bg-leaf-400/[0.07] p-4 ring-1 ring-leaf-400/20">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-leaf-300" strokeWidth={1.5} />
                    <p lang="bn" className="text-sm leading-relaxed text-ink/85">
                      {m.explanation}
                    </p>
                  </div>
                ) : (
                  !m.correct && (
                    <p lang="bn" className="text-xs text-ink-subtle">
                      এই পরীক্ষার সমাধান অ্যাডমিন গোপন রেখেছেন।
                    </p>
                  )
                )}
                {m.retake && (
                  <Link href={`/exam/${m.examId}`} className="mt-4 inline-flex text-sm font-semibold text-brand-300 hover:underline">
                    <span lang="bn">এই সেট আবার প্র্যাকটিস করো →</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
        {mistakes.length > 0 && (
          <p lang="bn" className="mt-6 text-center text-xs text-ink-subtle">
            সর্বশেষ {toBn(mistakes.length)}টি ভুল দেখানো হচ্ছে
          </p>
        )}
      </section>
    </main>
  );
}
