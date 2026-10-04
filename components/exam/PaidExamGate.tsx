"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileQuestion,
  HelpCircle,
  Hourglass,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { submitPaymentRequestAction } from "@/app/exam/[id]/actions";
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo } from "@/components/payment/PaymentLogos";
import { LEVELS, STREAMS, getSubjects } from "@/lib/data/catalog";
import { formatMinutesBn, toBn, formatDateBn } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PaymentMethod, PaymentRequest, PlanType, PublicUser, StoredExam } from "@/lib/types";

interface PaidExamGateProps {
  exam: StoredExam;
  user: PublicUser;
  initialPayment?: PaymentRequest | null;
}

export function PaidExamGate({ exam, user, initialPayment }: PaidExamGateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selected Plan: 'monthly' (৳২৯৯) or 'exam' (৳৫০)
  const [planType, setPlanType] = useState<PlanType>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [senderPhone, setSenderPhone] = useState(user.phone || "");
  const [trxId, setTrxId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active payment state (from props or updated after submission)
  const [activePayment, setActivePayment] = useState<PaymentRequest | null>(initialPayment ?? null);

  const subject = getSubjects(exam.level, exam.stream).find((s) => s.id === exam.subjectId);
  const examSinglePrice = exam.price || 50;
  const currentPrice = planType === "monthly" ? 299 : examSinglePrice;
  const personalNumber = "01798802374";

  const handleCopy = () => {
    navigator.clipboard.writeText(personalNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (isDemo = false) => {
    setError(null);
    const formData = new FormData();
    formData.append("examId", exam.id);
    formData.append("planType", planType);
    formData.append("paymentMethod", paymentMethod);
    formData.append("senderPhone", isDemo ? user.phone : senderPhone);
    formData.append("trxId", isDemo ? `TEST_${Date.now()}` : trxId);
    formData.append("isDemo", isDemo ? "true" : "false");

    startTransition(async () => {
      const res = await submitPaymentRequestAction(formData);
      if (res.ok) {
        if (res.status === "approved") {
          router.refresh();
        } else {
          setActivePayment({
            id: `pay_${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userPhone: user.phone,
            planType,
            examId: planType === "exam" ? exam.id : undefined,
            examTitle: exam.titleBn,
            amount: currentPrice,
            method: paymentMethod,
            senderPhone: senderPhone || user.phone,
            trxId: trxId.toUpperCase(),
            status: "pending",
            submittedAt: Date.now(),
          });
        }
      } else {
        setError(res.error ?? "পেমেন্ট যাচাই করা যায়নি। আবার চেষ্টা করো।");
      }
    });
  };

  const handleCheckStatus = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <main className="relative min-h-screen py-10 px-4 sm:px-6">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-brand opacity-60" />

      <div className="container max-w-3xl space-y-6">
        {/* Back Link */}
        <Link
          href={`/${exam.level}/${exam.stream}`}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-obsidian-900/80 px-3.5 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur transition-colors hover:border-brand-400 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span lang="bn">বিষয় তালিকায় ফিরে যাও</span>
        </Link>

        {/* Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-amber-400/30 bg-obsidian-900 shadow-2xl">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-obsidian-900 to-amber-500/10 p-6 sm:p-8 border-b border-surface-border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/40">
                <CreditCard className="h-3.5 w-3.5" />
                পেইড লাইভ পরীক্ষা (Paid Live Exam)
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                লাইভ মোড
              </span>
            </div>

            <p lang="bn" className="text-xs text-ink-subtle">
              {LEVELS[exam.level].nameBn} · {STREAMS[exam.stream].nameBn} · {subject?.nameBn ?? exam.subjectId}
            </p>
            <h1 lang="bn" className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">
              {exam.titleBn}
            </h1>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:p-8 border-b border-surface-border bg-obsidian-950/40">
            <div className="rounded-2xl border border-surface-border bg-obsidian-900 p-3.5 text-center">
              <Clock className="mx-auto h-5 w-5 text-brand-400 mb-1" />
              <p lang="bn" className="text-xs text-ink-subtle">সময়</p>
              <p lang="bn" className="font-bold text-ink text-sm sm:text-base">{formatMinutesBn(exam.durationSec)}</p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-obsidian-900 p-3.5 text-center">
              <FileQuestion className="mx-auto h-5 w-5 text-teal-400 mb-1" />
              <p lang="bn" className="text-xs text-ink-subtle">প্রশ্ন সংখ্যা</p>
              <p lang="bn" className="font-bold text-ink text-sm sm:text-base">{toBn(exam.questions.length)}টি</p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-obsidian-900 p-3.5 text-center">
              <ShieldAlert className="mx-auto h-5 w-5 text-rose-400 mb-1" />
              <p lang="bn" className="text-xs text-ink-subtle">নেগেটিভ মার্ক</p>
              <p lang="bn" className="font-bold text-ink text-sm sm:text-base">-{toBn(exam.negativeMark)}</p>
            </div>

            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3.5 text-center ring-1 ring-amber-400/20">
              <Sparkles className="mx-auto h-5 w-5 text-amber-300 mb-1" />
              <p lang="bn" className="text-xs text-amber-200">একক পরীক্ষার ফি</p>
              <p lang="bn" className="font-extrabold text-amber-300 text-lg sm:text-xl">৳{toBn(examSinglePrice)}</p>
            </div>
          </div>

          {/* If the candidate currently has a Pending payment request */}
          {activePayment && activePayment.status === "pending" ? (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-400/10 to-amber-500/5 p-6 text-center space-y-4 ring-1 ring-amber-400/20">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 ring-1 ring-amber-400/40">
                  <Hourglass className="h-7 w-7 text-amber-300 animate-spin [animation-duration:8s]" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
                    অপেক্ষমাণ · ভেরিফিকেশন চলছে
                  </span>
                  <h2 lang="bn" className="text-xl sm:text-2xl font-bold text-ink">
                    তোমার পেমেন্ট রিকোয়েস্ট জমা হয়েছে!
                  </h2>
                  <p lang="bn" className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto mt-1">
                    অ্যাডমিন তোমার পেমেন্ট TrxID যাচাই করে অনুমোদন (Permit) দিলেই পরীক্ষাটি স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।
                  </p>
                </div>

                {/* Submitted Request Card */}
                <div className="rounded-2xl border border-surface-border bg-obsidian-900/90 p-4 max-w-md mx-auto text-left space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="text-ink-subtle">প্ল্যান:</span>
                    <span className="font-bold text-ink" lang="bn">
                      {activePayment.planType === "monthly" ? "⭐ মাসিক অল-এক্সেস পাস (৩০ দিন)" : "একক পরীক্ষা"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="text-ink-subtle">ফি-এর পরিমাণ:</span>
                    <span className="font-extrabold text-amber-300 text-sm">৳{toBn(activePayment.amount)}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="text-ink-subtle">পেমেন্ট মেথড:</span>
                    <div className="flex items-center gap-2">
                      {activePayment.method === "bkash" && <BkashLogo size={20} />}
                      {activePayment.method === "nagad" && <NagadLogo size={20} />}
                      {activePayment.method === "rocket" && <RocketLogo size={20} />}
                      {activePayment.method === "upay" && <UpayLogo size={20} />}
                      <span className="font-semibold text-ink uppercase">{activePayment.method}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="text-ink-subtle">প্রেরক মোবাইল:</span>
                    <span className="font-mono text-ink font-semibold">{activePayment.senderPhone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ink-subtle">ট্রানজেকশন আইডি:</span>
                    <span className="font-mono font-bold text-brand-300 tracking-wider selection:bg-brand-400">
                      {activePayment.trxId}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={isPending}
                    className="btn-primary w-full py-2.5 text-xs font-bold"
                  >
                    <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                    <span lang="bn">{isPending ? "যাচাই হচ্ছে..." : "অনুমোদন স্ট্যাটাস রিফ্রেশ করো"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePayment(null)}
                    className="btn-ghost w-full sm:w-auto py-2.5 px-4 text-xs text-ink-muted hover:text-ink"
                  >
                    <span lang="bn">নতুন তথ্য দাও</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Main Pricing & Payment Form */
            <div className="p-6 sm:p-8 space-y-6">
              {/* Plan Choice: Monthly Fee vs Single Exam */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 lang="bn" className="text-sm font-bold text-ink">
                    ১. সাবস্ক্রিপশন প্ল্যান নির্বাচন করো:
                  </h3>
                  <span className="text-[11px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    স্পেশাল অফার
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {/* Monthly Pass Option */}
                  <div
                    onClick={() => setPlanType("monthly")}
                    className={cn(
                      "relative cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between",
                      planType === "monthly"
                        ? "border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/10"
                        : "border-surface-border bg-obsidian-950/60 hover:border-ink-muted",
                    )}
                  >
                    <div className="absolute top-3 right-3">
                      {planType === "monthly" ? (
                        <div className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center text-obsidian-950">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-surface-border" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        মাসিক অল-এক্সেস পাস
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-ink">৳{toBn(299)}</span>
                        <span className="text-xs text-ink-subtle">/ ৩০ দিন</span>
                      </div>
                      <p lang="bn" className="text-xs text-ink-muted mt-2 leading-relaxed">
                        ৩০ দিন ব্যাপী সকল পেইড ও লাইভ পরীক্ষা যত খুশি ততবার আনলিমিটেড দেওয়ার সুযোগ।
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-surface-border/50 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> সবচেয়ে সাশ্রয়ী ও জনপ্রিয়
                    </div>
                  </div>

                  {/* Single Exam Option */}
                  <div
                    onClick={() => setPlanType("exam")}
                    className={cn(
                      "relative cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between",
                      planType === "exam"
                        ? "border-brand-400 bg-brand-400/15 ring-2 ring-brand-400/40 shadow-lg shadow-brand-400/10"
                        : "border-surface-border bg-obsidian-950/60 hover:border-ink-muted",
                    )}
                  >
                    <div className="absolute top-3 right-3">
                      {planType === "exam" ? (
                        <div className="h-5 w-5 rounded-full bg-brand-400 flex items-center justify-center text-forest">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-surface-border" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-brand-300 font-bold text-xs mb-1">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        শুধুমাত্র এই একটি পরীক্ষা
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-ink">৳{toBn(examSinglePrice)}</span>
                        <span className="text-xs text-ink-subtle">/ একবার</span>
                      </div>
                      <p lang="bn" className="text-xs text-ink-muted mt-2 leading-relaxed">
                        শুধুমাত্র এই নির্দিষ্ট লাইভ পরীক্ষাটিতে অংশগ্রহণ ও মেধা তালিকায় আসার সুযোগ।
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-surface-border/50 text-[11px] text-ink-subtle font-medium">
                      একক পরীক্ষার টিকেট
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Payment Logos Selector */}
              <div>
                <h3 lang="bn" className="text-sm font-bold text-ink mb-1">
                  ২. পেমেন্ট মেথড নির্বাচন করো (Official Payment Gateways):
                </h3>
                <p lang="bn" className="text-xs text-ink-subtle mb-3">
                  যেকোনো একটি গেটওয়ে ক্লিক করে টাকা পাঠানোর ধাপগুলো দেখো
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center group",
                      paymentMethod === "bkash"
                        ? "border-[#E2136E] bg-[#E2136E]/15 ring-2 ring-[#E2136E]/50 shadow-md shadow-[#E2136E]/20"
                        : "border-surface-border bg-obsidian-950/60 hover:border-[#E2136E]/50",
                    )}
                  >
                    <BkashLogo size={36} className="transition-transform group-hover:scale-105" />
                    <span className="text-xs font-bold text-ink">বিকাশ (bKash)</span>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("nagad")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center group",
                      paymentMethod === "nagad"
                        ? "border-[#F7931E] bg-[#F7931E]/15 ring-2 ring-[#F7931E]/50 shadow-md shadow-[#F7931E]/20"
                        : "border-surface-border bg-obsidian-950/60 hover:border-[#F7931E]/50",
                    )}
                  >
                    <NagadLogo size={36} className="transition-transform group-hover:scale-105" />
                    <span className="text-xs font-bold text-ink">নগদ (Nagad)</span>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("rocket")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center group",
                      paymentMethod === "rocket"
                        ? "border-[#8C3494] bg-[#8C3494]/15 ring-2 ring-[#8C3494]/50 shadow-md shadow-[#8C3494]/20"
                        : "border-surface-border bg-obsidian-950/60 hover:border-[#8C3494]/50",
                    )}
                  >
                    <RocketLogo size={36} className="transition-transform group-hover:scale-105" />
                    <span className="text-xs font-bold text-ink">রকেট (Rocket)</span>
                  </button>

                  {/* Upay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upay")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center group",
                      paymentMethod === "upay"
                        ? "border-[#00A3E0] bg-[#00A3E0]/15 ring-2 ring-[#00A3E0]/50 shadow-md shadow-[#00A3E0]/20"
                        : "border-surface-border bg-obsidian-950/60 hover:border-[#00A3E0]/50",
                    )}
                  >
                    <UpayLogo size={36} className="transition-transform group-hover:scale-105" />
                    <span className="text-xs font-bold text-ink">উপায় (Upay)</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step instructions box */}
              <div className="rounded-2xl border border-surface-border bg-obsidian-950 p-4 space-y-3 text-xs" lang="bn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-brand-400" />
                    {paymentMethod === "bkash" ? "বিকাশ" : paymentMethod === "nagad" ? "নগদ" : paymentMethod === "rocket" ? "রকেট" : "উপায়"} Send Money নির্দেশিকা:
                  </span>
                  <span className="font-extrabold text-amber-300 text-sm">
                    পাঠাতে হবে: ৳{toBn(currentPrice)}
                  </span>
                </div>

                <div className="rounded-xl border border-brand-400/30 bg-brand-400/10 p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-ink-subtle block">ব্যক্তিগত মোবাইল নম্বর (Personal Number):</span>
                    <span className="font-mono text-base font-black text-brand-300 tracking-wider">
                      {personalNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-400/40 bg-obsidian-900 px-3 py-1.5 text-xs font-semibold text-brand-300 hover:bg-brand-400/20 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>নম্বর কপি করো</span>
                      </>
                    )}
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-ink-muted leading-relaxed">
                  <li>তোমার {paymentMethod.toUpperCase()} মোবাইল অ্যাপ ওপেন করে <strong>"Send Money"</strong> অপশনে যাও।</li>
                  <li>প্রাপক নম্বর দাও: <strong className="font-mono text-brand-300 font-bold">{personalNumber}</strong> (Personal)।</li>
                  <li>টাকার পরিমাণ লেখো: <strong className="text-amber-300 font-bold">৳{toBn(currentPrice)}</strong> টাকা।</li>
                  <li>রেফারেন্স হিসেবে তোমার মোবাইল নম্বর দিয়ে পিন চেপে সেন্ড মানি সম্পন্ন করো।</li>
                  <li>পেমেন্ট সফল হলে এসএমএস-এ প্রাপ্ত <strong className="text-ink">TrxID</strong> এবং তোমার নম্বর নিচে লিখে সাবমিট করো।</li>
                </ol>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" lang="bn">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4 pt-1">
                <h3 lang="bn" className="text-sm font-bold text-ink">
                  ৩. ট্রানজেকশন তথ্য পূরণ করো:
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label text-xs" lang="bn">
                      যে নম্বর থেকে টাকা পাঠিয়েছ *
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="field font-mono"
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
                      className="field font-mono uppercase tracking-wider"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isPending}
                  className="btn-primary w-full sm:flex-1 py-3.5 text-sm font-bold"
                >
                  <Lock className="h-4 w-4" />
                  <span lang="bn">
                    {isPending ? "যাচাই হচ্ছে..." : `পেমেন্ট তথ্য সাবমিট করো (৳${toBn(currentPrice)})`}
                  </span>
                </button>

                {/* 1-Click Instant Demo / Trial Unlock for effortless testing */}
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isPending}
                  title="অ্যাডমিনের অনুমোদন ছাড়া সরাসরি পরীক্ষামূলক আনলক করতে ক্লিক করো"
                  className="btn-ghost w-full sm:w-auto py-3.5 px-4 text-xs text-amber-300 border-amber-400/40 hover:bg-amber-400/10"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span lang="bn">⚡ টেস্ট আনলক (১-ক্লিক ট্রায়াল)</span>
                </button>
              </div>

              <div className="text-center">
                <p lang="bn" className="text-[11px] text-ink-subtle flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
                  সাবমিট করার পর অ্যাডমিন TrxID মিলিয়ে অনুমোদন (Permit) দিলেই পরীক্ষা শুরু হবে।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
