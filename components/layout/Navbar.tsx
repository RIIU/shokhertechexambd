"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  FileQuestion,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Radio,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  X,
} from "lucide-react";
import { useAppShell, type SessionUser } from "./AppShell";
import { LEVELS, STREAMS } from "@/lib/data/catalog";
import { formatPhone } from "@/lib/phone";
import { isFocusRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/packages", label: "প্যাকেজসমূহ" },
  { href: "/ssc", label: "এসএসসি" },
  { href: "/hsc", label: "এইচএসসি" },
  { href: "/subjects", label: "বিষয়সমূহ" },
];

function UserDropdown({
  user,
  home,
  onLogout,
}: {
  user: SessionUser;
  home: { href: string; label: string };
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-stretch">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 border-l border-forest px-4 text-sm text-ink transition-colors hover:bg-surface-pill"
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest font-display text-xs font-bold text-brand-300 ring-1 ring-brand-400/40">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover object-center" />
          ) : (
            user.name.trim().charAt(0).toUpperCase()
          )}
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-obsidian-800"
            title="সেশন সক্রিয়"
          />
        </span>
        <div className="flex flex-col text-left">
          <span lang="bn" className="max-w-[110px] truncate text-xs font-semibold text-ink">
            {user.name}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-ink-subtle">
            {user.role === "admin" ? "Admin" : "Student"}
          </span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-ink-muted transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-surface-border bg-obsidian-900/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {/* User details card */}
            <div className="mb-2 rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-brand-400/40 bg-forest font-display text-xs font-bold text-brand-300">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover object-center" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      {user.name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p lang="bn" className="truncate text-sm font-semibold text-ink">
                    {user.name}
                  </p>
                  <p className="truncate font-mono text-[11px] text-ink-subtle">{formatPhone(user.phone)}</p>
                </div>
              </div>

              {user.institution && (
                <p lang="bn" className="truncate text-[11px] text-ink-muted mb-2">
                  🏛️ {user.institution}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  সেশন সক্রিয়
                </span>
                {user.role === "admin" ? (
                  <span className="rounded bg-brand-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-300">
                    Admin
                  </span>
                ) : user.level && user.stream ? (
                  <span lang="bn" className="rounded bg-surface-pill px-1.5 py-0.5 text-[10px] text-ink-muted">
                    {LEVELS[user.level]?.nameBn} · {STREAMS[user.stream]?.nameBn}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Quick action links */}
            <ul className="space-y-1">
              <li>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
                >
                  <UserIcon className="h-4 w-4 text-amber-400" />
                  <span lang="bn">আমার প্রোফাইল ও ছবি</span>
                </Link>
              </li>
              <li>
                <Link
                  href={home.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4 text-brand-400" />
                  ) : (
                    <LayoutDashboard className="h-4 w-4 text-brand-400" />
                  )}
                  <span lang="bn">{home.label}</span>
                </Link>
              </li>
              {user.role === "student" && user.level && user.stream && (
                <li>
                  <Link
                    href={`/${user.level}/${user.stream}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
                  >
                    <BookOpen className="h-4 w-4 text-teal-400" />
                    <span lang="bn">আমার বিষয়সমূহ</span>
                  </Link>
                </li>
              )}
              {user.role === "admin" && (
                <li>
                  <Link
                    href="/admin/exams"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
                  >
                    <FileQuestion className="h-4 w-4 text-teal-400" />
                    <span lang="bn">পরীক্ষা ও প্রশ্ন</span>
                  </Link>
                </li>
              )}
            </ul>

            <div className="my-1.5 h-px bg-white/5" />

            {/* Instant Logout */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-state-danger/10"
            >
              <LogOut className="h-4 w-4" />
              <span lang="bn">লগআউট</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Full-width header with real-time auth status, active indicator, and user menu dropdown.
 */
export function Navbar() {
  const pathname = usePathname();
  const { user, loading, menuOpen, setMenuOpen, logout } = useAppShell();
  const home = user?.role === "admin" ? { href: "/admin", label: "অ্যাডমিন" } : { href: "/dashboard", label: "ড্যাশবোর্ড" };

  if (isFocusRoute(pathname)) return null;

  // Longest matching prefix wins, so /ssc/science highlights "বিষয়সমূহ" only.
  const activeHref = LINKS.map((l) => l.href)
    .filter((href) => (href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <header className="sticky top-0 z-50 border-b border-forest bg-obsidian-800">
      <nav className="flex h-14 items-stretch justify-between sm:h-16">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="মেনু খোলো"
            className="flex w-14 items-center justify-center bg-forest text-ink transition-colors hover:bg-leaf-600 sm:w-16 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2.5 px-4 sm:px-6 lg:px-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-400 font-display text-sm font-black text-forest">
              ST
            </span>
            <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
              ShokherTech<span className="text-brand-400">.</span>
            </span>
          </Link>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === activeHref;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  lang="bn"
                  className={cn(
                    "relative rounded-lg px-3.5 py-2 text-sm transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-surface-pill ring-1 ring-surface-border"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-stretch">
          {/* Account slot: Interactive real-time user dropdown or login link */}
          {!loading && (
            <div className="hidden items-stretch md:flex">
              {user ? (
                <UserDropdown user={user} home={home} onLogout={logout} />
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(pathname ?? "/")}`}
                  className="flex items-center gap-2 border-l border-forest px-5 text-sm text-ink transition-colors hover:bg-surface-pill"
                >
                  <LogIn className="h-4 w-4" />
                  <span lang="bn">লগইন</span>
                </Link>
              )}
            </div>
          )}
          <Link
            href={user ? "/exam/ssc-physics-live-01" : "/register"}
            className="flex items-center gap-2 bg-brand-400 px-4 text-sm font-semibold text-forest transition-colors hover:bg-brand-300 sm:px-6 lg:px-10"
          >
            {user ? <Radio className="h-4 w-4" strokeWidth={1.75} /> : <UserPlus className="h-4 w-4" strokeWidth={1.75} />}
            <span lang="bn" className="hidden min-[380px]:inline">
              {user ? "লাইভ পরীক্ষা" : "ফ্রি রেজিস্ট্রেশন"}
            </span>
            <span lang="bn" className="min-[380px]:hidden">
              {user ? "লাইভ" : "রেজিস্টার"}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
