"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Flag, Radio, ShieldCheck, Timer } from "lucide-react";
import { cn, toBn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const HEADLINE = ["প্রস্তুতি", "হোক", "স্মার্ট,", "পরীক্ষা", "হোক", "নিরাপদ।"];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from("[data-hero-chip]", { opacity: 0, y: 16, duration: 0.6 })
          .from("[data-word]", { yPercent: 110, opacity: 0, rotate: 4, duration: 0.9, stagger: 0.07 }, "-=0.3")
          .from("[data-hero-sub]", { opacity: 0, y: 20, duration: 0.7, stagger: 0.1 }, "-=0.5")
          .from("[data-preview]", { opacity: 0, y: 60, rotateX: 18, scale: 0.94, duration: 1.1, transformPerspective: 1200 }, "-=0.9")
          .from("[data-badge]", { opacity: 0, scale: 0.6, duration: 0.6, stagger: 0.12, ease: "back.out(2.5)" }, "-=0.6");

        // Idle float for the level badges
        gsap.to("[data-badge]", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.6, delay: 1.6 });

        // Pointer parallax on the preview stack (throttled to ~60fps)
        const xTo = gsap.quickTo("[data-parallax]", "x", { duration: 0.8, ease: "power3.out" });
        const yTo = gsap.quickTo("[data-parallax]", "y", { duration: 0.8, ease: "power3.out" });
        let rafId = 0;
        const onMove = (e: PointerEvent) => {
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            xTo((e.clientX / window.innerWidth - 0.5) * 24);
            yTo((e.clientY / window.innerHeight - 0.5) * 16);
            rafId = 0;
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
          window.removeEventListener("pointermove", onMove);
          if (rafId) cancelAnimationFrame(rafId);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden bg-hero">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-radial-brand" />
      {/* pixxen-style soft green glow on the right edge */}
      <div className="pointer-events-none absolute -right-48 top-1/3 -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(34,120,48,0.6),transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-60 -z-10 h-[420px] w-[420px] rounded-full bg-radial-glow blur-2xl" />

      <div className="container grid items-center gap-14 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr]">
        {/* Copy */}
        <div>
          <span data-hero-chip className="chip mb-6 border-brand-400/30 text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            <span lang="bn">এসএসসি ও এইচএসসি ২০২৬ প্রস্তুতি</span>
          </span>

          <h1 lang="bn" className="mb-6 text-[2.6rem] font-bold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-2 align-bottom">
                <span data-word className={cn("inline-block", i >= 3 ? "text-gradient" : "text-ink")}>
                  {w}
                </span>
                {i < HEADLINE.length - 1 && <span className="inline-block w-[0.28em]" />}
              </span>
            ))}
          </h1>

          <p data-hero-sub lang="bn" className="mb-8 max-w-xl text-lg leading-relaxed text-ink-muted">
            অধ্যায়ভিত্তিক অনুশীলন, বোর্ড মানের মডেল টেস্ট আর সারা দেশের সাথে লাইভ পরীক্ষা। কড়া অ্যান্টি-চিট পরিবেশে,
            সাথে সাথে ফলাফল ও বিশ্লেষণ।
          </p>

          <div data-hero-sub className="mb-10 flex flex-wrap gap-3">
            <Link href="/exam/ssc-physics-live-01" className="btn-primary px-6 py-3 text-base">
              <Radio className="h-5 w-5" strokeWidth={1.5} />
              <span lang="bn">লাইভ পরীক্ষা দাও</span>
            </Link>
            <Link href="#packages" className="btn-ghost px-6 py-3 text-base">
              <span lang="bn">প্যাকেজসমূহ দেখো</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <ul data-hero-sub className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {["ট্যাব-সুইচ মনিটর", "আইডেন্টিটি ওয়াটারমার্ক", "সার্ভার-সাইড গ্রেডিং"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-400" strokeWidth={1.5} />
                <span lang="bn">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none" data-parallax>
          <span
            data-badge
            className="absolute -left-4 -top-6 z-10 rounded-2xl border border-brand-400/40 bg-obsidian-800/90 px-4 py-2.5 shadow-glow backdrop-blur sm:-left-10"
          >
            <span className="block font-display text-lg font-black text-brand-300">SSC</span>
            <span lang="bn" className="block text-[11px] text-ink-muted">
              বিজ্ঞান · মানবিক · ব্যবসায়
            </span>
          </span>
          <span
            data-badge
            className="absolute -bottom-6 -right-2 z-10 rounded-2xl border border-leaf-400/40 bg-obsidian-800/90 px-4 py-2.5 shadow-glow-leaf backdrop-blur sm:-right-8"
          >
            <span className="block font-display text-lg font-black text-leaf-300">HSC</span>
            <span lang="bn" className="block text-[11px] text-ink-muted">
              ১ম ও ২য় পত্র
            </span>
          </span>

          <ExamPreview />
        </div>
      </div>
    </section>
  );
}

/** Static mock of the live exam UI used as hero art. */
function ExamPreview() {
  const palette = ["a", "a", "f", "a", "u", "c", "u", "u", "a", "u", "u", "u"] as const;
  return (
    <div data-preview className="border-animated animate-border-spin rounded-4xl p-5 shadow-glow-lg sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Live
          </p>
          <p lang="bn" className="text-sm font-semibold text-ink">
            পদার্থবিজ্ঞান: গতি
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-xl border border-state-danger/50 bg-state-danger/10 px-3 py-1.5 animate-danger-pulse">
          <Timer className="h-4 w-4 text-rose-300" strokeWidth={1.5} />
          <span lang="bn" className="font-display font-bold tabular-nums text-rose-200">
            ০৪:৫৮
          </span>
        </span>
      </div>

      <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-7/12 rounded-full bg-brand-gradient" />
      </div>

      <p lang="bn" className="mb-4 text-base font-semibold leading-relaxed text-ink">
        ৭২ km/h বেগকে m/s এককে প্রকাশ করলে কত হয়?
      </p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {[
          ["ক", "১০ m/s", false],
          ["খ", "২০ m/s", true],
          ["গ", "৩৬ m/s", false],
          ["ঘ", "২৫৯.২ m/s", false],
        ].map(([l, t, sel]) => (
          <div
            key={String(l)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 text-sm",
              sel ? "border-brand-400/70 bg-brand-400/10 text-ink shadow-glow-sm" : "border-surface-border text-ink-muted",
            )}
          >
            <span
              lang="bn"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                sel ? "bg-brand-400 text-forest" : "border border-white/15",
              )}
            >
              {l}
            </span>
            <span lang="bn">{t}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-surface-border pt-4">
        <div className="grid grid-cols-6 gap-1.5">
          {palette.map((s, i) => (
            <span
              key={i}
              lang="bn"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-semibold",
                s === "a" && "border-brand-400/60 bg-brand-400/15 text-brand-200",
                s === "f" && "border-state-flagged/60 bg-state-flagged/15 text-amber-200",
                s === "c" && "border-white text-ink shadow-[0_0_10px_-2px_rgba(255,255,255,0.55)]",
                s === "u" && "border-white/10 text-ink-subtle",
              )}
            >
              {toBn(i + 1)}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-amber-300">
          <Flag className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
          <span lang="bn">১টি চিহ্নিত</span>
        </span>
      </div>
    </div>
  );
}
