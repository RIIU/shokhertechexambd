import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Radio, Target, Trophy } from "lucide-react";
import { getResult } from "@/lib/server/attempts";
import { getExam } from "@/lib/server/exams";
import { getUser } from "@/lib/server/users";
import { shareToken, verifyShareToken } from "@/lib/server/share";
import { EXAM_TYPE_META, LEVELS, findSubject } from "@/lib/data/catalog";
import { percentileOf, verdictFor } from "@/lib/result-copy";
import { LIVE_EXAM_HREF } from "@/lib/routes";
import { formatClock, toBn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { attemptId: string };
  searchParams: { t?: string };
}

/** Only the score summary the owner chose to share: never answers or contact details. */
async function load({ params, searchParams }: Props) {
  if (!verifyShareToken(params.attemptId, searchParams.t)) return undefined;
  const data = await getResult(params.attemptId);
  if (!data) return undefined;
  const [exam, user] = await Promise.all([getExam(data.attempt.examId), getUser(data.attempt.userId)]);
  return { result: data.result, exam, name: user?.name ?? "শিক্ষার্থী", institution: user?.institution };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const d = await load(props);
  if (!d) return { title: "ফলাফল", robots: { index: false } };
  const { result, name } = d;
  const title = `${name}: ${toBn(result.score)}/${toBn(result.totalMarks)} · ${result.titleBn}`;
  const description = `র‍্যাংক #${toBn(result.rank)} (${toBn(result.participants)} জনের মধ্যে) · নির্ভুলতা ${toBn(result.accuracy)}%। তুমিও Shokher Tech Academy-তে লাইভ পরীক্ষা দাও।`;
  const image = `/share/${props.params.attemptId}/og?t=${shareToken(props.params.attemptId)}`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage(props: Props) {
  const d = await load(props);
  if (!d) notFound();
  const { result, exam, name, institution } = d;

  const pct = result.totalMarks > 0 ? Math.max(0, (result.score / result.totalMarks) * 100) : 0;
  const verdict = verdictFor(pct);
  const percentile = percentileOf(result.rank, result.participants);
  const subject = exam ? findSubject(exam.level, exam.stream, exam.subjectId) : undefined;
  const r = 70;
  const c = 2 * Math.PI * r;

  return (
    <main className="relative">
      <div className="page-backdrop" />
      <section className="container max-w-3xl pb-20 pt-10 sm:pt-16">
        <div className="card overflow-hidden">
          <div className="flex flex-col items-center gap-8 p-6 text-center sm:flex-row sm:p-10 sm:text-left">
            <div className="relative h-44 w-44 shrink-0">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle
                  cx="80"
                  cy="80"
                  r={r}
                  fill="none"
                  stroke="#99FE00"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - Math.min(100, pct) / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span lang="bn" className="font-display text-4xl font-bold text-ink">
                  {toBn(result.score)}
                  <span className="text-base font-semibold text-ink-subtle">/{toBn(result.totalMarks)}</span>
                </span>
                <span lang="bn" className="text-xs text-ink-subtle">
                  প্রাপ্ত নম্বর
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <p lang="bn" className="mb-1 text-sm text-ink-subtle">
                {[subject?.nameBn, exam && LEVELS[exam.level].nameBn, exam && EXAM_TYPE_META[exam.type].nameBn].filter(Boolean).join(" · ")}
              </p>
              <h1 lang="bn" className="mb-3 text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
                {result.titleBn}
              </h1>
              <p lang="bn" className="mb-4 text-ink-muted">
                <span className="font-semibold text-ink">{name}</span>
                {institution && <span> · {institution}</span>}
              </p>
              <span lang="bn" className="inline-flex rounded-full bg-brand-400/10 px-3 py-1 text-sm font-semibold text-brand-200 ring-1 ring-brand-400/15">
                {verdict.title}
                {result.participants > 1 && <span className="font-normal text-ink-muted">&nbsp;· {toBn(percentile)}% শিক্ষার্থীর চেয়ে এগিয়ে</span>}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-3 border-t border-surface-border">
            {[
              { icon: Trophy, label: "র‍্যাংক", value: `#${toBn(result.rank)}`, sub: `${toBn(result.participants)} জনের মধ্যে` },
              { icon: Target, label: "নির্ভুলতা", value: `${toBn(result.accuracy)}%`, sub: `${toBn(result.correct)}টি সঠিক` },
              { icon: Clock, label: "সময়", value: formatClock(result.timeTakenSec), sub: "মিনিট:সেকেন্ড" },
            ].map(({ icon: Icon, label, value, sub }, i) => (
              <div key={label} className={i ? "border-l border-surface-border p-4 sm:p-6" : "p-4 sm:p-6"}>
                <dt className="mb-1 flex items-center gap-1.5 text-xs text-ink-subtle">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span lang="bn">{label}</span>
                </dt>
                <dd lang="bn" className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {value}
                </dd>
                <dd lang="bn" className="text-xs text-ink-subtle">
                  {sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card mt-6 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
          <div>
            <p lang="bn" className="mb-1 text-lg font-bold text-ink">
              তুমিও নিজেকে যাচাই করো
            </p>
            <p lang="bn" className="text-sm text-ink-muted">
              সারা দেশের শিক্ষার্থীদের সাথে লাইভ পরীক্ষা, সাথে সাথে র‍্যাংক ও বিশ্লেষণ।
            </p>
          </div>
          <Link href={LIVE_EXAM_HREF} className="btn-primary shrink-0 px-6 py-3">
            <Radio className="h-4 w-4" strokeWidth={1.75} />
            <span lang="bn">লাইভ পরীক্ষা দাও</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
