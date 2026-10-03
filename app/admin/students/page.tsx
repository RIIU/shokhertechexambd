import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeader, Badge, Table } from "@/components/admin/AdminUi";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { setBlockedAction } from "@/app/admin/actions";
import { listUsers } from "@/lib/server/users";
import { listAttempts } from "@/lib/server/attempts";
import { LEVELS, STREAMS } from "@/lib/data/catalog";
import { formatPhone } from "@/lib/phone";
import { formatDateBn, toBn } from "@/lib/utils";

export const metadata = { title: "Students" };

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const [users, attempts] = await Promise.all([listUsers(), listAttempts({ submittedOnly: true })]);
  const stats = new Map<string, { n: number; pct: number; strikes: number }>();
  for (const a of attempts) {
    const s = stats.get(a.userId) ?? { n: 0, pct: 0, strikes: 0 };
    s.n += 1;
    s.pct += a.result && a.result.totalMarks ? (a.result.score / a.result.totalMarks) * 100 : 0;
    s.strikes += a.strikes;
    stats.set(a.userId, s);
  }
  const students = users
    .filter((u) => u.role === "student")
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.phone.includes(q.replace(/\D/g, "") || "\u0000") || (u.institution ?? "").toLowerCase().includes(q));

  return (
    <>
      <AdminHeader title="শিক্ষার্থী" subtitle={`মোট ${toBn(users.filter((u) => u.role === "student").length)} জন`} />
      <form className="mb-4 flex max-w-md items-center gap-2 rounded-2xl border border-surface-border bg-obsidian-900 px-4 py-2.5" role="search">
        <Search className="h-4 w-4 text-ink-subtle" />
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="নাম, মোবাইল বা প্রতিষ্ঠান খুঁজো"
          lang="bn"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
        />
      </form>
      <Table head={["নাম", "মোবাইল", "স্তর · বিভাগ", "যোগদান", "পরীক্ষা", "গড়", "সতর্কতা", ""]} empty={students.length ? undefined : "কাউকে পাওয়া যায়নি।"}>
        {students.map((u) => {
          const s = stats.get(u.id);
          return (
            <tr key={u.id} className={u.blocked ? "opacity-60" : undefined}>
              <td className="px-4 py-3">
                <span lang="bn" className="font-medium text-ink">
                  {u.name}
                </span>
                {u.institution && (
                  <span lang="bn" className="block text-xs text-ink-subtle">
                    {u.institution}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink-muted">{formatPhone(u.phone)}</td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {u.level ? LEVELS[u.level].nameBn : "—"} · {u.stream ? STREAMS[u.stream].nameBn : "—"}
              </td>
              <td className="px-4 py-3 text-ink-muted" lang="bn">
                {formatDateBn(u.createdAt)}
              </td>
              <td className="px-4 py-3 text-ink" lang="bn">
                <Link href={`/admin/attempts?user=${u.id}`} className="hover:text-brand-300">
                  {toBn(s?.n ?? 0)}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink" lang="bn">
                {s?.n ? `${toBn(Math.round(s.pct / s.n))}%` : "—"}
              </td>
              <td className="px-4 py-3" lang="bn">
                {s?.strikes ? <Badge tone="danger">{toBn(s.strikes)}</Badge> : <span className="text-ink-subtle">০</span>}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={setBlockedAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="blocked" value={u.blocked ? "0" : "1"} />
                  <ConfirmButton
                    message={u.blocked ? `${u.name}-এর অ্যাকাউন্ট আবার চালু করবে?` : `${u.name}-এর অ্যাকাউন্ট বন্ধ করবে? সে আর লগইন করতে পারবে না।`}
                    className={u.blocked ? "text-xs text-brand-300 hover:underline" : "text-xs text-rose-300 hover:underline"}
                  >
                    <span lang="bn">{u.blocked ? "চালু করো" : "ব্লক করো"}</span>
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
