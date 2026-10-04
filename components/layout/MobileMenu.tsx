"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Radio,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useAppShell } from "./AppShell";
import { LEVELS, STREAMS, STREAM_IDS } from "@/lib/data/catalog";
import { formatPhone } from "@/lib/phone";
import { isFocusRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Level } from "@/lib/types";

const LIVE_EXAM_HREF = "/exam/ssc-physics-live-01";

/**
 * Mobile navigation menu: full screen on phones under 480px (like pixxen.com), a 400px
 * side panel over a dimmed page on wider screens (tablets, narrow desktop windows).
 * Slides in from the left, locks page scroll, closes on Esc, backdrop tap,
 * a left swipe or any navigation, and returns focus to the menu button.
 */
export function MobileMenu() {
  const { user, loading, menuOpen, setMenuOpen, logout } = useAppShell();
  const pathname = usePathname() ?? "/";
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number; at: number } | null>(null);
  const [expanded, setExpanded] = useState<Level | null>(null);

  // Open the accordion for the level you are browsing.
  useEffect(() => {
    if (menuOpen) setExpanded(pathname.startsWith("/hsc") ? "hsc" : pathname.startsWith("/ssc") ? "ssc" : null);
  }, [menuOpen, pathname]);

  // Scroll lock, Esc to close, focus management.
  useEffect(() => {
    if (!menuOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      opener?.focus?.();
    };
  }, [menuOpen, setMenuOpen]);

  if (isFocusRoute(pathname)) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const close = () => setMenuOpen(false);

  return (
    <AnimatePresence>
      {menuOpen && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="মেনু">
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 bg-obsidian-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.nav
            aria-label="Mobile"
            className="absolute inset-y-0 left-0 flex w-full flex-col overflow-hidden bg-obsidian-800 min-[480px]:w-[400px] min-[480px]:border-r min-[480px]:border-forest min-[480px]:shadow-card"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            // Swipe left to close. Plain touch events (not drag) so the inner list can still scroll vertically.
            onTouchStart={(e) => {
              const t = e.touches[0];
              touchStart.current = t ? { x: t.clientX, y: t.clientY, at: Date.now() } : null;
            }}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              const t = e.changedTouches[0];
              touchStart.current = null;
              if (!start || !t) return;
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              const fast = Date.now() - start.at < 300 && dx < -40;
              if ((dx < -70 || fast) && Math.abs(dx) > Math.abs(dy) * 1.5) close();
            }}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-forest pl-4">
              <Link href="/" className="flex items-center gap-2.5" onClick={close}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-400 font-display text-xs font-black text-forest">ST</span>
                <span className="font-display text-base font-bold text-ink">
                  ShokherTech<span className="text-brand-400">.</span>
                </span>
              </Link>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-14 w-14 items-center justify-center bg-forest text-ink transition-colors active:bg-leaf-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 scrollbar-thin">
              {/* Account card */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                {loading ? (
                  <div className="h-[118px] animate-pulse rounded-2xl bg-surface-pill/60" />
                ) : user ? (
                  <div className="rounded-2xl border border-surface-border bg-radial-forest p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-400 font-display text-lg font-black text-forest">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover object-center" />
                        ) : (
                          user.name.trim().charAt(0).toUpperCase()
                        )}
                      </span>
                      <div className="min-w-0">
                        <p lang="bn" className="truncate font-semibold text-ink">
                          {user.name}
                        </p>
                        <p className="truncate font-mono text-xs text-ink-subtle">{formatPhone(user.phone)}</p>
                      </div>
                      {user.role === "admin" ? (
                        <span className="ml-auto rounded-full bg-brand-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">Admin</span>
                      ) : (
                        user.level &&
                        user.stream && (
                          <span lang="bn" className="ml-auto shrink-0 rounded-full bg-surface-pill px-2 py-0.5 text-[11px] text-ink-muted">
                            {LEVELS[user.level].nameBn} · {STREAMS[user.stream].nameBn}
                          </span>
                        )
                      )}
                    </div>
                    <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={close} className="btn-primary w-full py-2.5">
                      {user.role === "admin" ? <ShieldCheck className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                      <span lang="bn">{user.role === "admin" ? "অ্যাডমিন প্যানেল" : "আমার ড্যাশবোর্ড"}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-surface-border bg-radial-forest p-4">
                    <p lang="bn" className="mb-1 font-semibold text-ink">
                      ফ্রি অ্যাকাউন্ট খোলো
                    </p>
                    <p lang="bn" className="mb-3 text-xs text-ink-muted">
                      লাইভ পরীক্ষা, র‍্যাংক আর ফলাফলের হিসাব রাখতে লগইন করো।
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/login?next=${encodeURIComponent(pathname)}`} onClick={close} className="btn-ghost py-2.5">
                        <LogIn className="h-4 w-4" />
                        <span lang="bn">লগইন</span>
                      </Link>
                      <Link href="/register" onClick={close} className="btn-primary py-2.5">
                        <UserPlus className="h-4 w-4" />
                        <span lang="bn">রেজিস্ট্রেশন</span>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Main navigation */}
              <SectionLabel>মেনু</SectionLabel>
              <ul className="space-y-1">
                <Item index={0} href="/" icon={Home} label="হোম" active={isActive("/")} onNavigate={close} />
                <Item
                  index={1}
                  href="/#packages"
                  icon={Sparkles}
                  label="প্যাকেজসমূহ"
                  active={false}
                  onNavigate={close}
                  badge={
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-400/20 px-2 py-0.5 text-[10px] font-bold text-brand-300">
                      অফার
                    </span>
                  }
                />
                {(["ssc", "hsc"] as const).map((level, i) => (
                  <LevelItem
                    key={level}
                    index={i + 2}
                    level={level}
                    open={expanded === level}
                    onToggle={() => setExpanded((cur) => (cur === level ? null : level))}
                    isActive={isActive}
                    onNavigate={close}
                  />
                ))}
                <Item
                  index={3}
                  href={LIVE_EXAM_HREF}
                  icon={Radio}
                  label="লাইভ পরীক্ষা"
                  active={false}
                  onNavigate={close}
                  badge={
                    <span className="inline-flex items-center gap-1 rounded-full bg-state-danger/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
                      </span>
                      Live
                    </span>
                  }
                />
              </ul>

              {/* Account section */}
              {user && (
                <>
                  <SectionLabel>অ্যাকাউন্ট</SectionLabel>
                  <ul className="space-y-1">
                    <Item index={4} href="/profile" icon={UserIcon} label="আমার প্রোফাইল ও ছবি" active={isActive("/profile")} onNavigate={close} />
                    {user.role === "admin" ? (
                      <>
                        <Item index={5} href="/admin" icon={ShieldCheck} label="ওভারভিউ" active={pathname === "/admin"} onNavigate={close} />
                        <Item index={6} href="/admin/exams" icon={FileQuestion} label="পরীক্ষা ও প্রশ্ন" active={isActive("/admin/exams")} onNavigate={close} />
                      </>
                    ) : (
                      <>
                        <Item index={4} href="/dashboard" icon={LayoutDashboard} label="ড্যাশবোর্ড" active={isActive("/dashboard")} onNavigate={close} />
                        {user.level && user.stream && (
                          <Item
                            index={5}
                            href={`/${user.level}/${user.stream}`}
                            icon={BookOpen}
                            label="আমার বিষয়সমূহ"
                            active={isActive(`/${user.level}/${user.stream}`)}
                            onNavigate={close}
                          />
                        )}
                      </>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          void logout();
                        }}
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-left text-rose-300 transition-colors active:bg-state-danger/10 hover:bg-state-danger/10"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-state-danger/10">
                          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </span>
                        <span lang="bn" className="text-[15px] font-medium">
                          লগআউট
                        </span>
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {/* Footer: pixxen-style oversized wordmark */}
            <div className="relative shrink-0 overflow-hidden border-t border-forest bg-section px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
              <p lang="bn" className="relative z-10 text-xs text-ink-subtle">
                এসএসসি ও এইচএসসি অনলাইন পরীক্ষা
              </p>
              <p aria-hidden="true" className="pointer-events-none -mb-3 select-none font-display text-[64px] font-black leading-none tracking-tighter text-forest/60">
                ShokherTech
              </p>
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p lang="bn" className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
      {children}
    </p>
  );
}

function rowClass(active: boolean) {
  return cn(
    "relative flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
    active ? "bg-surface-pill text-ink" : "text-ink-muted active:bg-surface-pill/70",
  );
}

function RowIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        active ? "bg-brand-400 text-forest" : "bg-obsidian-900 text-brand-300 ring-1 ring-surface-border",
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </span>
  );
}

function ActiveBar({ active }: { active: boolean }) {
  return active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-400" /> : null;
}

const itemMotion = (index: number) => ({
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.1 + index * 0.04, duration: 0.25 },
});

function Item({
  index,
  href,
  icon,
  label,
  active,
  onNavigate,
  badge,
}: {
  index: number;
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onNavigate: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <motion.li {...itemMotion(index)}>
      <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={rowClass(active)}>
        <ActiveBar active={active} />
        <RowIcon icon={icon} active={active} />
        <span lang="bn" className="flex-1 text-[15px] font-medium">
          {label}
        </span>
        {badge ?? <ChevronRight className="h-4 w-4 text-ink-subtle" />}
      </Link>
    </motion.li>
  );
}

function LevelItem({
  index,
  level,
  open,
  onToggle,
  isActive,
  onNavigate,
}: {
  index: number;
  level: Level;
  open: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const active = isActive(`/${level}`);
  const panelId = `menu-${level}`;
  return (
    <motion.li {...itemMotion(index)}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className={rowClass(active)}>
        <ActiveBar active={active} />
        <RowIcon icon={GraduationCap} active={active} />
        <span className="flex-1">
          <span lang="bn" className="block text-[15px] font-medium">
            {LEVELS[level].nameBn}
          </span>
          <span lang="bn" className="block text-[11px] text-ink-subtle">
            {LEVELS[level].fullBn}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink-subtle transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="ml-[30px] overflow-hidden border-l border-surface-border pl-3"
          >
            {STREAM_IDS.map((stream) => {
              const href = `/${level}/${stream}`;
              const on = isActive(href);
              return (
                <li key={stream}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "my-0.5 flex min-h-[44px] items-center justify-between rounded-lg px-3 text-[14px] transition-colors",
                      on ? "bg-brand-400/10 font-semibold text-brand-300" : "text-ink-muted active:bg-surface-pill/70",
                    )}
                  >
                    <span lang="bn">{STREAMS[stream].nameBn}</span>
                    <span className="text-[11px] text-ink-subtle">{STREAMS[stream].nameEn}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={`/${level}`}
                onClick={onNavigate}
                className="my-0.5 flex min-h-[44px] items-center gap-1 rounded-lg px-3 text-[13px] text-brand-400 active:bg-surface-pill/70"
              >
                <span lang="bn">সব বিভাগ দেখো</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
