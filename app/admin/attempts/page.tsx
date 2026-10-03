import Link from "next/link";
import { AdminHeader, Badge, Table } from "@/components/admin/AdminUi";
import { readDb } from "@/lib/server/db";
import { rankFor } from "@/lib/server/attempts";
import { formatPhone } from "@/lib/phone";
import { formatClock, formatDateBn, toBn } from "@/lib/utils";

export const metadata = { title: "Results" };

const REASON: Record<string, { label: string; tone: "muted" | "amber" | "danger" }> = {
  manual: { label: "নিজে জমা", tone: "muted" },
  "time-up": { label: "সময় শেষ", tone: "amber" },
  "max-warnings": { label: "সতর্কতায় অটো-জমা", tone: "danger" },
};

export default async function AttemptsPage({ searchParams }: { searchParams: { exam?: string; user?: string } }) {
  const db = await readDb();
  const users = new Map(db.users.map((u) => [u.id, u]));
  const exams = new Map(db.exams.map((e) => [e.id, e]));
  const rows = db.attempts
    .filter((a) => a.result)
    .filter((a) => (!searchParams.exam || a.examId === searchParams.exam) && (!searchParams.user || a.userId === searchParams.user))
    .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))
    .slice(0, 300);
  const filteredBy = searchParams.exam ? exams.get(searchParams.exam)?.titleBn : searchParams.user ? users.get(searchParams.user)?.name : undefined;

  return (
    <>
      <AdminHeader
        title="ফলাফল"
        subtitle={filteredBy ? `ফিল্টার: ${filteredBy}` : "সাম্প্রতিক ৩০০টি জমা"}
        action={
          filteredBy ? (
            <Link href="/admin/attempts" className="btn-ghost py-2">
              <span lang="bn">ফিল্টার সরাও</span>
            </Link>
          ) : undefined
        }
      />
      <Table head={["শিক্ষার্থী", "পরীক্ষা", "জমা", "স্কোর", "র‍্যাংক", "সময়", "সতর্কতা", "কারণ"]} empty={rows.length ? undefined : "এখনো কোনো জমা নেই।"}>
        {rows.map((a) => {
          const r = a.result!;
          const u = users.get(a.userId);
          const rank = rankFor(db.attempts, a.examId, r.score);
          const reason = REASON[a.reason ?? "manual"] ?? REASON.manual!;
          return (
            <tr key={a.id} className="hover:bg-surface-pill/40">
              <td className="px-4 py-3">
                <Link href={`/admin/attempts?user=${a.userId}`} lang="bn" className="font-medium text-ink hover:text-brand-300">
                  {u?.name ?? "—"}
                </Link>
                <span className="block font-mono text-xs text-ink-subtle">{u ? formatPhone(u.phone) : ""}</span>
              </td>
              <td className="max-w-[220px] px-4 py-3">
                <Link href={`/admin/attempts?exam=${a.examId}`} lang="bn" className="line-clamp-2 text-ink-muted hover:text-brand-300">
                  {exams.get(a.examId)?.titleBn ?? a.examId}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {formatDateBn(a.submittedAt!, true)}
              </td>
              <td className="px-4 py-3" lang="bn">
                <Link href={`/results/${a.id}`} className="font-display font-bold text-ink hover:text-brand-300">
                  {toBn(r.score)}/{toBn(r.totalMarks)}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                #{toBn(rank.rank)}/{toBn(rank.participants)}
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {formatClock(r.timeTakenSec)}
              </td>
              <td className="px-4 py-3" lang="bn">
                {a.strikes ? <Badge tone="danger">{toBn(a.strikes)}</Badge> : <span className="text-ink-subtle">০</span>}
              </td>
              <td className="px-4 py-3" lang="bn">
                <Badge tone={reason.tone}>{reason.label}</Badge>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
