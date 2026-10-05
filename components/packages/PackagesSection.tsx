"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  HelpCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo } from "@/components/payment/PaymentLogos";
import { PackageCheckoutModal } from "./PackageCheckoutModal";
import { useAppShell } from "@/components/layout/AppShell";
import {
  SUBSCRIPTION_PACKAGES,
  COURSE_PACKAGES,
  PACKAGE_FAQS,
  type SubscriptionPackage,
  type CoursePackage,
} from "@/lib/data/packages";
import { cn, toBn } from "@/lib/utils";

type TabMode = "subscription" | "course";

export function PackagesSection() {
  const { user } = useAppShell();
  const [tab, setTab] = useState<TabMode>("subscription");
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | CoursePackage | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="packages" className="relative isolate py-20 overflow-hidden" aria-labelledby="packages-title">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 -z-10 h-[520px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_center,rgba(18,183,106,0.07),transparent_70%)]" />

      <div className="container space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="chip border-brand-400/30 text-brand-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span lang="bn">সেরা প্রস্তুতি প্যাকেজ</span>
          </span>

          <h2 id="packages-title" lang="bn" className="text-3xl font-extrabold text-ink sm:text-5xl tracking-tight">
            চর্চা করো নিজের গতিতে, <span className="text-gradient">পছন্দের প্যাকেজে</span>
          </h2>

          <p lang="bn" className="text-base sm:text-lg text-ink-muted leading-relaxed">
            মাসিক অল-এক্সেস সাবস্ক্রিপশন অথবা কোর্স প্যাকেজ নিয়ে শুরু করো পূর্ণাঙ্গ প্রস্তুতি।
            আনলিমিটেড পরীক্ষা, বোর্ড প্রশ্নব্যাংক, লাইভ লিডারবোর্ড ও তাৎক্ষণিক বিশ্লেষণ।
          </p>

          {/* Tab Switcher */}
          <div className="pt-2 flex justify-center">
            <div role="tablist" aria-label="প্যাকেজ ক্যাটাগরি" className="glass relative inline-flex rounded-2xl p-1.5 shadow-card">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "subscription"}
                onClick={() => setTab("subscription")}
                className={cn(
                  "relative rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all",
                  tab === "subscription" ? "text-forest" : "text-ink-muted hover:text-ink",
                )}
              >
                {tab === "subscription" && (
                  <motion.span
                    layoutId="package-tab-pill"
                    className="absolute inset-0 rounded-xl bg-brand-400 shadow-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span lang="bn">সাবস্ক্রিপশন প্ল্যান (১, ৩, ৬ ও ১২ মাস)</span>
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === "course"}
                onClick={() => setTab("course")}
                className={cn(
                  "relative rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all",
                  tab === "course" ? "text-forest" : "text-ink-muted hover:text-ink",
                )}
              >
                {tab === "course" && (
                  <motion.span
                    layoutId="package-tab-pill"
                    className="absolute inset-0 rounded-xl bg-brand-400 shadow-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span lang="bn">কোর্স ও বোর্ড প্যাকেজ (SSC & HSC)</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Subscription Packages (Chorcha Style Cards) */}
        {tab === "subscription" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PACKAGES.map((pkg, i) => {
              const isPopular = pkg.popular;
              const isBestValue = pkg.bestValue;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={cn(
                    "relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1.5",
                    isPopular
                      ? "border-brand-400/80 bg-gradient-to-b from-brand-50 via-white to-white ring-4 ring-brand-400/10 shadow-lift"
                      : isBestValue
                        ? "border-amber-400/60 bg-gradient-to-b from-amber-50 via-white to-white ring-1 ring-amber-400/20 shadow-card"
                        : "border-surface-border bg-obsidian-900/80 hover:border-ink/20 shadow-card",
                  )}
                >
                  {/* Top Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider shadow-md",
                          isPopular
                            ? "bg-brand-400 text-forest ring-2 ring-obsidian-900"
                            : "bg-amber-400 text-ink ring-2 ring-obsidian-900",
                        )}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                      <h3 lang="bn" className="text-xl font-bold text-ink">
                        {pkg.nameBn}
                      </h3>
                      <span className="rounded-full bg-surface-pill px-2.5 py-0.5 text-[11px] text-ink-subtle">
                        {pkg.durationDays} দিন
                      </span>
                    </div>

                    <p lang="bn" className="text-xs text-ink-muted leading-relaxed mb-4 min-h-[36px]">
                      {pkg.taglineBn}
                    </p>

                    {/* Price section */}
                    <div className="rounded-2xl border border-surface-border/60 bg-obsidian-950/60 p-3.5 mb-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-ink">
                          ৳{toBn(pkg.price)}
                        </span>
                        <span className="text-sm line-through text-ink-subtle">
                          ৳{toBn(pkg.originalPrice)}
                        </span>
                        <span className="ml-auto rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                          -৳{toBn(pkg.originalPrice - pkg.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-brand-300 font-medium">
                        {pkg.monthlyEquivBn}
                      </p>
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-2.5 mb-6 text-xs" lang="bn">
                      <p className="text-[11px] uppercase tracking-wider text-ink-subtle font-bold">
                        প্যাকেজে যা থাকছে:
                      </p>
                      {pkg.features.map((feat, fi) => (
                        <div key={fi} className="flex items-start gap-2 text-ink-muted">
                          <Check className="h-4 w-4 text-brand-400 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span className="leading-snug text-ink/90">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all",
                      isPopular
                        ? "btn-primary shadow-glow-sm hover:scale-[1.02]"
                        : "btn-ghost hover:border-brand-400 hover:text-brand-300",
                    )}
                  >
                    <span lang="bn">প্যাকেজটি শুরু করো</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Course / Board Packages */}
        {tab === "course" && (
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {COURSE_PACKAGES.map((pkg, i) => {
              const isPopular = pkg.popular;
              const targetHref = pkg.stream && pkg.stream !== "all" ? `/${pkg.level}/${pkg.stream}` : `/${pkg.level}`;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={cn(
                    "relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5",
                    isPopular
                      ? "border-amber-400/80 bg-gradient-to-b from-amber-50 via-white to-white ring-4 ring-amber-400/10 shadow-lift"
                      : "border-surface-border bg-obsidian-900/80 hover:border-ink/20 shadow-card",
                  )}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Link
                        href={targetHref}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-ink shadow-md ring-2 ring-obsidian-900 hover:bg-amber-300 transition-colors"
                      >
                        {pkg.badge}
                      </Link>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                      <Link
                        href={targetHref}
                        lang="bn"
                        className="text-xl font-bold text-ink hover:text-brand-300 transition-colors flex items-center gap-1.5 group/title"
                      >
                        <span>{pkg.nameBn}</span>
                        <ArrowRight className="h-4 w-4 text-ink-muted opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
                      </Link>
                      <span className="rounded-full bg-surface-pill px-2.5 py-0.5 text-[11px] text-ink-subtle shrink-0">
                        {pkg.durationLabelBn}
                      </span>
                    </div>

                    <p lang="bn" className="text-xs text-ink-muted leading-relaxed mb-4 min-h-[36px]">
                      {pkg.taglineBn}
                    </p>

                    <div className="rounded-2xl border border-surface-border/60 bg-obsidian-950/60 p-3.5 mb-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-ink">
                          ৳{toBn(pkg.price)}
                        </span>
                        <span className="text-sm line-through text-ink-subtle">
                          ৳{toBn(pkg.originalPrice)}
                        </span>
                        <span className="ml-auto rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                          -৳{toBn(pkg.originalPrice - pkg.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-amber-300 font-medium">
                        এককালীন ফি · মেয়াদকালীন সম্পূর্ণ অ্যাক্সেস
                      </p>
                    </div>

                    <div className="space-y-2.5 mb-6 text-xs" lang="bn">
                      <p className="text-[11px] uppercase tracking-wider text-ink-subtle font-bold">
                        কোর্সে যা যা থাকছে:
                      </p>
                      {pkg.features.map((feat, fi) => (
                        <div key={fi} className="flex items-start gap-2 text-ink-muted">
                          <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span className="leading-snug text-ink/90">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        isPopular
                          ? "btn-primary shadow-glow-sm hover:scale-[1.02]"
                          : "btn-ghost hover:border-amber-400 hover:text-amber-300",
                      )}
                    >
                      <span lang="bn">কোর্স প্যাকেজটি নাও (৳{toBn(pkg.price)})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <Link
                      href={targetHref}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-brand-300 hover:text-brand-200 hover:bg-brand-400/10 border border-brand-400/20 transition-all"
                    >
                      <span lang="bn">{pkg.stream === "science" ? "বিজ্ঞান বিষয় ও পরীক্ষাগুলো দেখো" : "বিষয় ও পরীক্ষাসমূহ দেখো"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Payment Gateways & Trust Banner */}
        <div className="rounded-3xl border border-surface-border bg-white/60 p-6 sm:p-8 shadow-card max-w-4xl mx-auto backdrop-blur">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <p className="text-xs uppercase tracking-wider text-ink-subtle font-bold">
                Payment Partners
              </p>
              <h4 lang="bn" className="text-base font-bold text-ink">
                ১০০% নিরাপদ ও সহজ পেমেন্ট মাধ্যম
              </h4>
              <p lang="bn" className="text-xs text-ink-muted">
                বিকাশ, নগদ, রকেট বা উপায় থেকে সেন্ড মানি করে দ্রুত সাবস্ক্রিপশন চালু করো।
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-2 rounded-2xl bg-obsidian-950/80 border border-surface-border">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <BkashLogo size={28} />
                <span className="text-xs font-semibold text-ink">বিকাশ</span>
              </div>
              <div className="h-6 w-px bg-surface-border" />
              <div className="flex items-center gap-1.5 px-2 py-1">
                <NagadLogo size={28} />
                <span className="text-xs font-semibold text-ink">নগদ</span>
              </div>
              <div className="h-6 w-px bg-surface-border" />
              <div className="flex items-center gap-1.5 px-2 py-1">
                <RocketLogo size={28} />
                <span className="text-xs font-semibold text-ink">রকেট</span>
              </div>
              <div className="h-6 w-px bg-surface-border" />
              <div className="flex items-center gap-1.5 px-2 py-1">
                <UpayLogo size={28} />
                <span className="text-xs font-semibold text-ink">উপায়</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-surface-border/60 text-xs">
            <div className="flex items-center gap-2.5 text-ink-muted">
              <Zap className="h-4 w-4 text-brand-400 shrink-0" />
              <span>তাৎক্ষণিক ভেরিফিকেশন ও সক্রিয়করণ</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>কোনো লুকানো শর্ত বা অটো-কাটা নেই</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-muted">
              <Radio className="h-4 w-4 text-rose-400 shrink-0" />
              <span>সকল লাইভ পরীক্ষা ও মেগা টেস্ট অন্তর্ভুক্ত</span>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto pt-6 space-y-4">
          <div className="text-center mb-6">
            <span className="chip mb-2 border-surface-border text-ink-subtle">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h3 lang="bn" className="text-2xl font-bold text-ink">
              প্যাকেজ সম্পর্কিত সাধারণ জিজ্ঞাসা
            </h3>
          </div>

          <div className="space-y-3">
            {PACKAGE_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-surface-border bg-white/70 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-ink hover:text-brand-300 transition-colors"
                  >
                    <span lang="bn">{faq.qBn}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 text-ink-subtle transition-transform duration-200 shrink-0 ml-2", isOpen && "rotate-180 text-brand-400")}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-ink/5">
                          <p lang="bn">{faq.aBn}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPackage && (
        <PackageCheckoutModal
          packageItem={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          user={user}
        />
      )}
    </section>
  );
}
