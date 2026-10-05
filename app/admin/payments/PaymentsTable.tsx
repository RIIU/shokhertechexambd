"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  HelpCircle,
  Hourglass,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { approvePaymentAction, rejectPaymentAction } from "./actions";
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo } from "@/components/payment/PaymentLogos";
import { Badge } from "@/components/admin/AdminUi";
import { formatDateBn, toBn } from "@/lib/utils";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { PaymentRequest, PaymentStatus } from "@/lib/types";

interface PaymentsTableProps {
  initialRequests: PaymentRequest[];
}

export function PaymentsTable({ initialRequests }: PaymentsTableProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<"all" | PaymentStatus>("pending");
  const [search, setSearch] = useState("");
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrx(text);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const handleApprove = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await approvePaymentAction(id);
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "approved", reviewedAt: Date.now() } : r,
          ),
        );
        router.refresh();
      } else {
        alert(res.error || "অনুমোদন করা সম্ভব হয়নি।");
      }
      setPendingId(null);
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("বাতিল করার কারণ লিখুন (ঐচ্ছিক):", "ভুল TrxID বা টাকা পাওয়া যায়নি");
    if (reason === null) return; // user cancelled prompt

    setPendingId(id);
    startTransition(async () => {
      const res = await rejectPaymentAction(id, reason);
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "rejected", notes: reason, reviewedAt: Date.now() } : r,
          ),
        );
        router.refresh();
      } else {
        alert(res.error || "বাতিল করা সম্ভব হয়নি।");
      }
      setPendingId(null);
    });
  };

  const filtered = requests.filter((r) => {
    if (activeTab !== "all" && r.status !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      r.userPhone.includes(q) ||
      r.senderPhone.includes(q) ||
      r.trxId.toLowerCase().includes(q) ||
      (r.examTitle && r.examTitle.toLowerCase().includes(q))
    );
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-surface-border bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "pending"
                ? "bg-amber-400 font-bold text-ink shadow-sm"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span>পেন্ডিং অনুমোদন</span>
            {pendingCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  activeTab === "pending"
                    ? "bg-white text-amber-700"
                    : "bg-amber-400/20 text-amber-300",
                )}
              >
                {toBn(pendingCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "approved"
                ? "bg-emerald-400 font-bold text-forest shadow-sm"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span>অনুমোদিত</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                activeTab === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-emerald-400/20 text-emerald-300",
              )}
            >
              {toBn(approvedCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "rejected"
                ? "bg-rose-500 font-bold text-white shadow-sm"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span>বাতিলকৃত</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                activeTab === "rejected"
                  ? "bg-rose-900 text-rose-200"
                  : "bg-rose-500/20 text-rose-300",
              )}
            >
              {toBn(rejectedCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
              activeTab === "all"
                ? "bg-surface-border font-bold text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span>সব ({toBn(requests.length)})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, মোবাইল বা TrxID খুঁজুন..."
            className="field pl-9 py-2 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs text-ink-subtle">
              <th lang="bn" className="px-4 py-3 font-medium">শিক্ষার্থী</th>
              <th lang="bn" className="px-4 py-3 font-medium">প্ল্যান / পরীক্ষা</th>
              <th lang="bn" className="px-4 py-3 font-medium">মেথড</th>
              <th lang="bn" className="px-4 py-3 font-medium">প্রেরক ও TrxID</th>
              <th lang="bn" className="px-4 py-3 font-medium">পরিমাণ</th>
              <th lang="bn" className="px-4 py-3 font-medium">সময়</th>
              <th lang="bn" className="px-4 py-3 font-medium">স্ট্যাটাস</th>
              <th lang="bn" className="px-4 py-3 text-right font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-muted" lang="bn">
                  {search ? "কোনো পেমেন্ট রিকোয়েস্ট মেলেনি।" : "এই তালিকায় কোনো পেমেন্ট রিকোয়েস্ট নেই।"}
                </td>
              </tr>
            ) : (
              filtered.map((req) => {
                const isWorking = pendingId === req.id && isPending;
                return (
                  <tr key={req.id} className="hover:bg-obsidian-950/40 transition-colors">
                    {/* Student Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink leading-tight">{req.userName}</div>
                      <div className="font-mono text-xs text-ink-muted">{formatPhone(req.userPhone)}</div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3.5">
                      {req.planType === "monthly" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                          ⭐ মাসিক অল-এক্সেস
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300">
                          একক পরীক্ষা
                        </span>
                      )}
                      {req.examTitle && (
                        <span className="block text-[11px] text-ink-subtle truncate max-w-[180px] mt-0.5" title={req.examTitle}>
                          {req.examTitle}
                        </span>
                      )}
                    </td>

                    {/* Method Logo */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {req.method === "bkash" && <BkashLogo size={24} />}
                        {req.method === "nagad" && <NagadLogo size={24} />}
                        {req.method === "rocket" && <RocketLogo size={24} />}
                        {req.method === "upay" && <UpayLogo size={24} />}
                        <span className="font-bold text-xs uppercase text-ink">{req.method}</span>
                      </div>
                    </td>

                    {/* Sender & TrxID */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs text-ink-muted">{req.senderPhone}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-xs text-brand-300 tracking-wider">
                          {req.trxId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(req.trxId)}
                          title="TrxID কপি করো"
                          className="text-ink-subtle hover:text-brand-300 transition-colors"
                        >
                          {copiedTrx === req.trxId ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-ink text-sm">৳{toBn(req.amount)}</span>
                    </td>

                    {/* Submitted At */}
                    <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                      {formatDateBn(req.submittedAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                          <Hourglass className="h-3 w-3" /> অপেক্ষমাণ
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> অনুমোদিত
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                          <XCircle className="h-3 w-3" /> বাতিল
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id)}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-bold text-forest hover:bg-emerald-300 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>অনুমোদন করো</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(req.id)}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      ) : req.status === "approved" ? (
                        <span className="text-xs text-emerald-400/80 font-medium">
                          ✓ অ্যাক্সেস সক্রিয়
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400/80 font-medium">
                          বাতিলকৃত
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
