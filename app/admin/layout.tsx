import type { Metadata } from "next";
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
        <div className="mb-4 hidden items-center gap-2 rounded-2xl border border-surface-border bg-obsidian-900 p-3 lg:flex">
          <ShieldCheck className="h-5 w-5 text-brand-400" strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-brand-400">Control Center</p>
            <p lang="bn" className="truncate text-sm text-ink">
              {admin.name}
            </p>
          </div>
        </div>
        <AdminNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
