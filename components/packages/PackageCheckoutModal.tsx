"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  HelpCircle,
  Hourglass,
  Lock,
  LogIn,
  Sparkles,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { submitPackagePaymentAction } from "@/app/actions/package-payment";
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo } from "@/components/payment/PaymentLogos";
import { toBn, cn } from "@/lib/utils";
import type { SubscriptionPackage, CoursePackage } from "@/lib/data/packages";
import type { PaymentMethod } from "@/lib/types";
import type { SessionUser } from "@/components/layout/AppShell";

interface PackageCheckoutModalProps {
  packageItem: SubscriptionPackage | CoursePackage | null;
  onClose: () => void;
  user: SessionUser | null;
}

export function PackageCheckoutModal({ packageItem, onClose, user }: PackageCheckoutModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [senderPhone, setSenderPhone] = useState(user ? "" : "");
  const [trxId, setTrxId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<"pending" | "approved" | null>(null);

  if (!packageItem) return null;

  const personalNumber = "01798802374";

  const handleCopy = () => {
    navigator.clipboard.writeText(personalNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (isDemo = false) => {
    setError(null);
    const formData = new FormData();
    formData.append("packageId", packageItem.id);
    formData.append("packageName", packageItem.nameBn);
    formData.append("amount", String(packageItem.price));
    formData.append("durationDays", String(packageItem.durationDays));
    formData.append("paymentMethod", paymentMethod);
    formData.append("senderPhone", isDemo ? "01700000000" : senderPhone);
    formData.append("trxId", isDemo ? `TEST_${Date.now()}` : trxId);
    formData.append("isDemo", isDemo ? "true" : "false");

    startTransition(async () => {
      const res = await submitPackagePaymentAction(formData);
      if (res.ok) {
        setSubmittedStatus(res.status ?? "pending");
        router.refresh();
      } else {
        setError(res.error ?? "পেমেন্ট সম্পন্ন করা যায়নি। আবার চেষ্টা করো।");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 overflow-hidden rounded-3xl border border-surface-border bg-obsidian-900 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করো"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-obsidian-800 text-ink-muted transition-colors hover:bg-obsidian-700 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-surface-border bg-gradient-to-r from-brand-900/40 via-obsidian-900 to-amber-900/30 p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-400/20 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/40">
              <Sparkles className="h-3.5 w-3.5" />
              প্যাকেজ সাবস্ক্রিপশন
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
              <Clock className="h-3.5 w-3.5" />
              {packageItem.durationLabelBn}
            </span>
          </div>

          <h2 lang="bn" className="text-xl sm:text-2xl font-bold text-ink">
            {packageItem.nameBn}
          </h2>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-brand-300">
              ৳{toBn(packageItem.price)}
            </span>
            <span className="text-sm line-through text-ink-subtle">
              ৳{toBn(packageItem.originalPrice)}
            </span>
            {"monthlyEquivBn" in packageItem && (
              <span className="rounded-full bg-surface-pill px-2.5 py-0.5 text-xs text-ink-muted">
                {packageItem.monthlyEquivBn}
              </span>
            )}
          </div>
        </div>

        {/* If user is NOT logged in */}
        {!user ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/30">
              <LogIn className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 lang="bn" className="text-lg font-bold text-ink">
                অ্যাকাউন্টে লগইন করো
              </h3>
              <p lang="bn" className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                প্যাকেজটি সাবস্ক্রাইব করতে এবং তোমার অ্যাকাউন্টে পরীক্ষাগুলো আনলক করতে প্রথমে লগইন বা ফ্রি রেজিস্ট্রেশন করো।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-sm mx-auto">
              <Link
                href={`/login?next=${encodeURIComponent("/packages")}`}
                className="btn-ghost flex-1 py-3"
              >
                <LogIn className="h-4 w-4" />
                <span lang="bn">লগইন</span>
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent("/packages")}`}
                className="btn-primary flex-1 py-3"
              >
                <UserPlus className="h-4 w-4" />
                <span lang="bn">ফ্রি রেজিস্ট্রেশন</span>
              </Link>
            </div>
          </div>
        ) : submittedStatus === "approved" ? (
          /* Instant Approved Screen */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 lang="bn" className="text-xl font-bold text-ink">
                অভিনন্দন! প্যাকেজটি সক্রিয় হয়েছে 🎉
              </h3>
              <p lang="bn" className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                তোমার সাবস্ক্রিপশন সফলভাবে চালু হয়েছে। এখন তুমি সকল বিষয়, অধ্যায় এবং মডেল টেস্টে অংশ নিতে পারবে।
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" onClick={onClose} className="btn-primary py-3 px-6 text-sm">
                <span>আমার ড্যাশবোর্ডে যাও</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost py-3 px-6 text-sm text-ink-muted"
              >
                <span>বন্ধ করো</span>
              </button>
            </div>
          </div>
        ) : submittedStatus === "pending" ? (
          /* Pending Screen */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
              <Hourglass className="h-8 w-8 animate-spin [animation-duration:8s]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
                যাচাই চলছে · অপেক্ষমাণ
              </span>
              <h3 lang="bn" className="text-xl font-bold text-ink">
                তোমার পেমেন্ট তথ্য জমা হয়েছে!
              </h3>
              <p lang="bn" className="text-sm text-ink-muted mt-1.5 max-w-md mx-auto leading-relaxed">
                অ্যাডমিন TrxID যাচাই করলেই তোমার অ্যাকাউন্টে প্যাকেজটি সক্রিয় হয়ে যাবে। তুমি ড্যাশবোর্ডে স্ট্যাটাস দেখতে পারবে।
              </p>
            </div>
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary py-3 px-8 text-sm"
              >
                <span>ঠিক আছে</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="p-6 sm:p-8 space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-ink mb-2" lang="bn">
                ১. পেমেন্ট মেথড নির্বাচন করো:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all",
                    paymentMethod === "bkash"
                      ? "border-[#E2136E] bg-[#E2136E]/15 ring-2 ring-[#E2136E]/50 shadow-md shadow-[#E2136E]/20"
                      : "border-surface-border bg-obsidian-950/60 hover:border-[#E2136E]/50",
                  )}
                >
                  <BkashLogo size={32} />
                  <span className="text-xs font-bold text-ink">বিকাশ</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("nagad")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all",
                    paymentMethod === "nagad"
                      ? "border-[#F7931E] bg-[#F7931E]/15 ring-2 ring-[#F7931E]/50 shadow-md shadow-[#F7931E]/20"
                      : "border-surface-border bg-obsidian-950/60 hover:border-[#F7931E]/50",
                  )}
                >
                  <NagadLogo size={32} />
                  <span className="text-xs font-bold text-ink">নগদ</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("rocket")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all",
                    paymentMethod === "rocket"
                      ? "border-[#8C3494] bg-[#8C3494]/15 ring-2 ring-[#8C3494]/50 shadow-md shadow-[#8C3494]/20"
                      : "border-surface-border bg-obsidian-950/60 hover:border-[#8C3494]/50",
                  )}
                >
                  <RocketLogo size={32} />
                  <span className="text-xs font-bold text-ink">রকেট</span>
                </button>

                {/* Upay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upay")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all",
                    paymentMethod === "upay"
                      ? "border-[#00A3E0] bg-[#00A3E0]/15 ring-2 ring-[#00A3E0]/50 shadow-md shadow-[#00A3E0]/20"
                      : "border-surface-border bg-obsidian-950/60 hover:border-[#00A3E0]/50",
                  )}
                >
                  <UpayLogo size={32} />
                  <span className="text-xs font-bold text-ink">উপায়</span>
                </button>
              </div>
            </div>

            {/* Send Money Guide */}
            <div className="rounded-2xl border border-surface-border bg-obsidian-950 p-4 space-y-2.5 text-xs" lang="bn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-brand-400" />
                  {paymentMethod === "bkash" ? "বিকাশ" : paymentMethod === "nagad" ? "নগদ" : paymentMethod === "rocket" ? "রকেট" : "উপায়"} সেন্ড মানি নম্বর:
                </span>
                <span className="font-bold text-brand-300">
                  পরিমাণ: ৳{toBn(packageItem.price)}
                </span>
              </div>

              <div className="rounded-xl border border-brand-400/30 bg-brand-400/10 p-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-base font-bold text-brand-300 tracking-wider">
                    {personalNumber}
                  </span>
                  <span className="text-[11px] text-ink-subtle ml-2">(Personal)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-400/40 bg-obsidian-900 px-2.5 py-1 text-xs font-medium text-brand-300 hover:bg-brand-400/20"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>কপি</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-ink-muted leading-relaxed">
                অ্যাপ থেকে উপরে প্রদত্ত নম্বরে <strong>Send Money</strong> করে এসএমএস-এ পাওয়া <strong>TrxID</strong> এবং তোমার নম্বর নিচে প্রদান করো।
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" lang="bn">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label text-xs" lang="bn">
                  যে নম্বর থেকে টাকা পাঠিয়েছ *
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="field font-mono text-sm py-2.5"
                  required
                />
              </div>

              <div>
                <label className="field-label text-xs" lang="bn">
                  ট্রানজেকশন আইডি (TrxID) *
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BL89XK21M9"
                  className="field font-mono uppercase tracking-wider text-sm py-2.5"
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isPending}
                className="btn-primary w-full sm:flex-1 py-3 text-sm font-bold"
              >
                <Lock className="h-4 w-4" />
                <span lang="bn">
                  {isPending ? "যাচাই হচ্ছে..." : `পেমেন্ট নিশ্চিত করো (৳${toBn(packageItem.price)})`}
                </span>
              </button>

              {/* 1-Click Instant Demo / Trial button */}
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
                title="অ্যাডমিন অনুমোদন ছাড়াই সরাসরি পরীক্ষামূলকভাবে প্যাকেজ অ্যাক্টিভ করতে ক্লিক করো"
                className="btn-ghost w-full sm:w-auto py-3 px-4 text-xs text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span lang="bn">⚡ টেস্ট অ্যাক্টিভেশন</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
