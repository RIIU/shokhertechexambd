import type { Metadata } from "next";
import { CreditCard, DollarSign, Hourglass, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/server/auth";
import { listPaymentRequests } from "@/lib/server/payments";
import { AdminHeader } from "@/components/admin/AdminUi";
import { PaymentsTable } from "./PaymentsTable";
import { toBn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পেমেন্ট অনুমোদন · অ্যাডমিন",
  description: "বিকাশ, নগদ, রকেট পেমেন্ট ভেরিফিকেশন ও অনুমোদন",
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const requests = await listPaymentRequests();

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const totalRevenue = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="পেমেন্ট অনুমোদন ও ট্রানজেকশন"
        subtitle="বিকাশ, নগদ, রকেট ও উপায়ের মাধ্যমে আসা মাসিক সাবস্ক্রিপশন ও পরীক্ষার ফি অনুমোদন করো"
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Pending Requests */}
        <div className="rounded-3xl border border-amber-400/40 bg-amber-400/10 p-4 sm:p-5 ring-1 ring-amber-400/20">
          <div className="flex items-center justify-between text-xs text-amber-200">
            <span lang="bn">অপেক্ষমাণ আবেদন</span>
            <Hourglass className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300">
            {toBn(pendingCount)}
            <span className="text-xs font-normal text-amber-200 ml-1">টি</span>
          </div>
        </div>

        {/* Approved Requests */}
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span lang="bn">অনুমোদিত পেমেন্ট</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-300">
            {toBn(approvedCount)}
            <span className="text-xs font-normal text-emerald-200 ml-1">টি</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-3xl border border-brand-400/30 bg-brand-400/10 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-brand-200">
            <span lang="bn">মোট সংগৃহীত ফি</span>
            <DollarSign className="h-4 w-4 text-brand-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-brand-300">
            ৳{toBn(totalRevenue)}
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="rounded-3xl border border-surface-border bg-obsidian-900 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-ink-subtle">
            <span lang="bn">মোট ট্রানজেকশন</span>
            <CreditCard className="h-4 w-4 text-ink-muted" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            {toBn(totalCount)}
            <span className="text-xs font-normal text-ink-subtle ml-1">টি</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Table */}
      <PaymentsTable initialRequests={requests} />
    </div>
  );
}
