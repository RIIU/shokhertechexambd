import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Badge, Table } from "@/components/admin/AdminUi";
import { listExams } from "@/lib/server/exams";
import { listAttempts } from "@/lib/server/attempts";
import { EXAM_TYPE_META, LEVELS, STREAMS, getSubjects } from "@/lib/data/catalog";
import { formatDateBn, formatMinutesBn, toBn } from "@/lib/utils";

export const metadata = { title: "Exams" };

export default async function AdminExamsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status === "draft" || searchParams.status === "published" ? searchParams.status : undefined;
  const [exams, attempts] = await Promise.all([listExams(), listAttempts({ submittedOnly: true })]);
  const shown = exams.filter((e) => !status || e.status === status);
  const subCount = new Map<string, number>();
  for (const a of attempts) subCount.set(a.examId, (subCount.get(a.examId) ?? 0) + 1);

  const tabs = [
    { key: undefined, label: "সব" },
    { key: "published", label: "প্রকাশিত" },
    { key: "draft", label: "খসড়া" },
  ];

  return (
    <>
      <AdminHeader
        title="পরীক্ষা ও প্রশ্নব্যাংক"
        subtitle={`মোট ${toBn(exams.length)}টি পরীক্ষা`}
        action={
          <Link href="/admin/exams/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span lang="bn">নতুন পরীক্ষা</span>
          </Link>
        }
      />
      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/exams?status=${t.key}` : "/admin/exams"}
            lang="bn"
            className={status === t.key ? "chip border-brand-400/50 text-brand-300" : "chip hover:text-ink"}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <Table head={["পরীক্ষা", "বিষয়", "ধরন", "প্রশ্ন", "সময়", "জমা", "অবস্থা"]} empty={shown.length ? undefined : "কোনো পরীক্ষা নেই।"}>
        {shown.map((e) => {
          const subject = getSubjects(e.level, e.stream).find((s) => s.id === e.subjectId);
          return (
            <tr key={e.id} className="hover:bg-surface-pill/40">
              <td className="px-4 py-3">
                <Link href={`/admin/exams/${e.id}`} lang="bn" className="font-medium text-ink hover:text-brand-300">
                  {e.titleBn}
                </Link>
                <p className="text-xs text-ink-subtle" lang="bn">
                  হালনাগাদ {formatDateBn(e.updatedAt)}
                </p>
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {subject?.nameBn ?? e.subjectId}
                <span className="block text-xs text-ink-subtle">
                  {LEVELS[e.level].nameBn} · {STREAMS[e.stream].nameBn}
                </span>
              </td>
              <td className="px-4 py-3" lang="bn">
                <Badge tone={e.type === "live" ? "danger" : "muted"}>{EXAM_TYPE_META[e.type].nameBn}</Badge>
              </td>
              <td className="px-4 py-3 text-ink" lang="bn">
                {toBn(e.questions.length)}
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {formatMinutesBn(e.durationSec)}
              </td>
              <td className="px-4 py-3 text-ink" lang="bn">
                {toBn(subCount.get(e.id) ?? 0)}
              </td>
              <td className="px-4 py-3" lang="bn">
                <Badge tone={e.status === "published" ? "brand" : "amber"}>{e.status === "published" ? "প্রকাশিত" : "খসড়া"}</Badge>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
