import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="container grid gap-6 pb-12 pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:pt-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          href="/profile"
          className="mb-4 hidden items-center gap-3 rounded-2xl border border-surface-border bg-obsidian-900 p-3 transition-colors hover:border-brand-400/60 lg:flex group"
          title="প্রোফাইল ও ছবি পরিবর্তন করো"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-400/40 bg-forest font-display text-sm font-bold text-brand-300">
            {admin.avatarUrl ? (
              <img src={admin.avatarUrl} alt={admin.name} className="h-full w-full object-cover object-center" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {admin.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-400 flex items-center justify-between">
              Admin
              <span className="text-[9px] lowercase text-ink-subtle group-hover:text-brand-300">এডিট →</span>
            </p>
            <p lang="bn" className="truncate text-sm font-semibold text-ink">
              {admin.name}
            </p>
          </div>
        </Link>
        <AdminNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
