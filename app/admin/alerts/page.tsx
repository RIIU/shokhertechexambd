import Link from "next/link";
import { AdminHeader, Badge, Table } from "@/components/admin/AdminUi";
import { listViolations } from "@/lib/server/attempts";
import { listExams } from "@/lib/server/exams";
import { listUsers } from "@/lib/server/users";
import { formatPhone } from "@/lib/phone";
import { formatDateBn, toBn } from "@/lib/utils";
import type { ViolationKind } from "@/lib/types";

export const metadata = { title: "Anti-cheat log" };

const KIND_BN: Record<ViolationKind, string> = {
  "tab-hidden": "ট্যাব/অ্যাপ পরিবর্তন",
  "window-blur": "উইন্ডো থেকে ফোকাস সরেছে",
  "fullscreen-exit": "ফুলস্ক্রিন ত্যাগ",
  "watermark-tamper": "ওয়াটারমার্ক পরিবর্তন",
  "devtools-open": "ডেভটুলস খোলা (সম্ভাব্য)",
  "blocked-shortcut": "নিষিদ্ধ শর্টকাট",
  "context-menu": "রাইট-ক্লিক",
  clipboard: "কপি/পেস্ট",
  "split-screen": "স্প্লিট-স্ক্রিন / ছোট উইন্ডো",
  extension: "ব্রাউজার এক্সটেনশন (সম্ভাব্য AI)",
  "multi-screen": "একাধিক মনিটর",
};

export default async function AlertsPage({ searchParams }: { searchParams: { all?: string; attempt?: string } }) {
  const strikesOnly = searchParams.all !== "1";
  const [rows, userList, examList] = await Promise.all([
    listViolations({ strikeOnly: strikesOnly, attemptId: searchParams.attempt, limit: 500 }),
    listUsers(),
    listExams(),
  ]);
  const users = new Map(userList.map((u) => [u.id, u]));
  const exams = new Map(examList.map((e) => [e.id, e]));

  return (
    <>
      <AdminHeader
        title="অ্যান্টি-চিট লগ"
        subtitle="সতর্কতা = ট্যাব পরিবর্তন, ফোকাস হারানো, ফুলস্ক্রিন ত্যাগ বা ওয়াটারমার্ক পরিবর্তন। বাকিগুলো শুধু লগ হয়।"
      />
      <div className="mb-4 flex gap-2">
        <Link href="/admin/alerts" lang="bn" className={strikesOnly ? "chip border-brand-400/50 text-brand-300" : "chip hover:text-ink"}>
          শুধু সতর্কতা
        </Link>
        <Link href="/admin/alerts?all=1" lang="bn" className={!strikesOnly ? "chip border-brand-400/50 text-brand-300" : "chip hover:text-ink"}>
          সব ঘটনা
        </Link>
      </div>
      <Table head={["সময়", "শিক্ষার্থী", "পরীক্ষা", "ঘটনা", "বিস্তারিত", "আইপি"]} empty={rows.length ? undefined : "কোনো ঘটনা নেই।"}>
        {rows.map((v) => {
          const u = v.userId ? users.get(v.userId) : undefined;
          return (
            <tr key={v.id}>
              <td className="whitespace-nowrap px-4 py-3 text-ink-muted" lang="bn">
                {formatDateBn(v.at, true)}
              </td>
              <td className="px-4 py-3">
                <span lang="bn" className="text-ink">
                  {u?.name ?? "—"}
                </span>
                <span className="block font-mono text-xs text-ink-subtle">{u ? formatPhone(u.phone) : ""}</span>
              </td>
              <td className="max-w-[200px] px-4 py-3" lang="bn">
                {v.attemptId ? (
                  <Link href={`/admin/alerts?all=1&attempt=${v.attemptId}`} className="line-clamp-2 text-ink-muted hover:text-brand-300">
                    {exams.get(v.examId)?.titleBn ?? v.examId}
                  </Link>
                ) : (
                  <span className="text-ink-muted">{exams.get(v.examId)?.titleBn ?? v.examId}</span>
                )}
              </td>
              <td className="px-4 py-3" lang="bn">
                <Badge tone={v.strike ? "danger" : "muted"}>{KIND_BN[v.kind] ?? v.kind}</Badge>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{v.detail ?? ""}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{v.ip ?? ""}</td>
            </tr>
          );
        })}
      </Table>
      <p lang="bn" className="mt-3 text-xs text-ink-subtle">
        সর্বশেষ {toBn(rows.length)}টি দেখানো হচ্ছে
      </p>
    </>
  );
}
