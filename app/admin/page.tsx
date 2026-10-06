import Link from "next/link";
import { Activity, ArrowRight, CreditCard, FileCheck2, Radio, ShieldAlert, Users } from "lucide-react";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { EmptyState, Panel, StatTile } from "@/components/ui/StatTile";
import { adminOverview } from "@/lib/server/stats";
import { countPendingPayments } from "@/lib/server/payments";
import { formatPhone } from "@/lib/phone";
import { formatClock, formatDateBn, toBn } from "@/lib/utils";

export const metadata = { title: "Overview" };

const KIND_BN: Record<string, string> = {
  "tab-hidden": "ট্যাব পরিবর্তন",
  "window-blur": "উইন্ডো থেকে ফোকাস সরেছে",
  "fullscreen-exit": "ফুলস্ক্রিন ত্যাগ",
  "watermark-tamper": "ওয়াটারমার্ক পরিবর্তন",
  "split-screen": "স্প্লিট-স্ক্রিন / ছোট উইন্ডো",
  extension: "ব্রাউজার এক্সটেনশন (সম্ভাব্য AI)",
};

export default async function AdminOverviewPage() {
  const [data, pendingPayments] = await Promise.all([adminOverview(), countPendingPayments()]);
  const k = data.kpis;
  const maxDay = Math.max(1, ...data.perDay.map((d) => d.count));
  const now = Date.now();

  return (
    <>
      <AutoRefresh seconds={10} />
      <AdminHeader title="ওভারভিউ" subtitle="প্রতি ১০ সেকেন্ডে আপডেট হয়" />

      {pendingPayments > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 ring-1 ring-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p lang="bn" className="text-sm font-bold text-ink">
                {toBn(pendingPayments)}টি নতুন পেমেন্ট রিকোয়েস্ট অনুমোদনের অপেক্ষায় রয়েছে!
              </p>
              <p lang="bn" className="text-xs text-ink-muted">
                শিক্ষার্থীরা বিকাশ/নগদে ফি পাঠিয়ে TrxID সাবমিট করেছে। পরীক্ষা আনলক করতে অনুমোদন দিন।
              </p>
            </div>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-obsidian-950 hover:bg-amber-300 transition-colors shadow-sm"
          >
            <span>পেমেন্ট যাচাই ও অনুমোদন</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={Users} label="শিক্ষার্থী" value={toBn(k.students)} hint={`গত ২৪ ঘণ্টায় নতুন ${toBn(k.newStudents24h)} জন`} />
        <StatTile icon={FileCheck2} label="প্রকাশিত পরীক্ষা" value={toBn(k.publishedExams)} hint={`খসড়া ${toBn(k.draftExams)}টি`} tone="leaf" />
        <StatTile icon={Activity} label="জমা (২৪ ঘণ্টা)" value={toBn(k.submissions24h)} hint={`মোট ${toBn(k.submissionsTotal)}টি`} tone="leaf" />
        <StatTile icon={ShieldAlert} label="সতর্কতা (২৪ ঘণ্টা)" value={toBn(k.strikes24h)} hint="ট্যাব/ফুলস্ক্রিন লঙ্ঘন" tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel
          title="লাইভ মনিটর"
          action={
            <Badge tone={k.liveNow ? "danger" : "muted"}>
              <Radio className="mr-1 h-3 w-3" /> <span lang="bn">{toBn(k.liveNow)} জন পরীক্ষা দিচ্ছে</span>
            </Badge>
          }
        >
          {data.live.length ? (
            <ul className="divide-y divide-surface-border">
              {data.live.map((a) => (
                <li key={a.attemptId} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span lang="bn" className="block truncate text-sm font-medium text-ink">
                      {a.student} <span className="font-normal text-ink-subtle">· {formatPhone(a.phone)}</span>
                    </span>
                    <span lang="bn" className="block truncate text-xs text-ink-subtle">
                      {a.exam}
                    </span>
                  </span>
                  {a.strikes > 0 && <Badge tone="danger">সতর্কতা {toBn(a.strikes)}</Badge>}
                  <span lang="bn" className="w-16 text-right font-display text-sm tabular-nums text-ink-muted">
                    {formatClock((a.endsAt - now) / 1000)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="এই মুহূর্তে কেউ পরীক্ষা দিচ্ছে না।" />
          )}
        </Panel>

        <Panel title="সাম্প্রতিক সতর্কতা" action={<Link href="/admin/alerts" lang="bn" className="text-sm text-brand-400 hover:underline">সব দেখো</Link>}>
          {data.recentAlerts.length ? (
            <ul className="divide-y divide-surface-border">
              {data.recentAlerts.map((v) => (
                <li key={v.id} className="py-3">
                  <p lang="bn" className="text-sm text-ink">
                    <span className="font-medium">{v.student}</span> · <span className="text-rose-300">{KIND_BN[v.kind] ?? v.kind}</span>
                  </p>
                  <p lang="bn" className="truncate text-xs text-ink-subtle">
                    {v.exam} · {formatDateBn(v.at, true)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="কোনো সতর্কতা নেই।" />
          )}
        </Panel>
      </div>

      <Panel title="গত ১৪ দিনে জমা হওয়া পরীক্ষা" className="mt-6">
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Submissions per day, last 14 days">
          {data.perDay.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <span
                lang="bn"
                className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-obsidian-800 px-2 py-1 text-[11px] text-ink opacity-0 shadow-card ring-1 ring-surface-border transition-opacity group-hover:opacity-100"
              >
                {formatDateBn(d.day)}: {toBn(d.count)}টি
              </span>
              <div
                className="rounded-t-[4px] bg-brand-400 transition-colors group-hover:bg-brand-300"
                style={{ height: `${d.count ? Math.max(4, (d.count / maxDay) * 100) : 0}%` }}
              />
              <div className="h-px bg-surface-border" />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-subtle" lang="bn">
          <span>{formatDateBn(data.perDay[0]!.day)}</span>
          <span>আজ</span>
        </div>
      </Panel>
    </>
  );
}
