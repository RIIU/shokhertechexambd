"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Home, LayoutDashboard, LogIn, Menu, Radio, ShieldCheck, type LucideIcon } from "lucide-react";
import { useAppShell } from "./AppShell";
import { LIVE_EXAM_HREF, isFocusRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * App-style bottom navigation on phones: the four places students go most,
 * a raised "live exam" button in the middle, and the full menu.
 */
export function MobileTabBar() {
  const { user, menuOpen, setMenuOpen } = useAppShell();
  const pathname = usePathname() ?? "/";
  if (isFocusRoute(pathname)) return null;

  const subjectsHref = user?.level && user.stream ? `/${user.level}/${user.stream}` : "/ssc";
  const account: { href: string; label: string; icon: LucideIcon } = !user
    ? { href: `/login?next=${encodeURIComponent(pathname)}`, label: "লগইন", icon: LogIn }
    : user.role === "admin"
      ? { href: "/admin", label: "অ্যাডমিন", icon: ShieldCheck }
      : { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard };

  const on = (prefix: string) => (prefix === "/" ? pathname === "/" : pathname.startsWith(prefix));
  const tabs = [
    { href: "/", label: "হোম", icon: Home, active: on("/") },
    { href: subjectsHref, label: "বিষয়", icon: BookOpen, active: on("/ssc") || on("/hsc") },
    null, // centre button
    { href: account.href, label: account.label, icon: account.icon, active: on("/dashboard") || on("/admin") || on("/login") || on("/results") },
  ];

  return (
    <>
      {/* Keeps the footer clear of the fixed bar and its raised centre button */}
      <div aria-hidden="true" className="h-[calc(88px+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-forest bg-obsidian-800/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      >
        <ul className="grid h-16 grid-cols-5">
          {tabs.map((t, i) =>
            t ? (
              <li key={t.label}>
                <Link
                  href={t.href}
                  aria-current={t.active ? "page" : undefined}
                  className={cn("relative flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors", t.active ? "text-brand-300" : "text-ink-subtle active:text-ink")}
                >
                  {t.active && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute top-0 h-0.5 w-8 rounded-b-full bg-brand-400"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <t.icon className="h-[22px] w-[22px]" strokeWidth={t.active ? 2 : 1.6} />
                  <span lang="bn">{t.label}</span>
                </Link>
              </li>
            ) : (
              <li key={`centre-${i}`} className="flex items-start justify-center">
                <Link
                  href={LIVE_EXAM_HREF}
                  aria-label="লাইভ পরীক্ষা"
                  className="-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-brand-400 text-forest shadow-glow ring-4 ring-obsidian-800 transition-transform active:scale-95"
                >
                  <Radio className="h-6 w-6" strokeWidth={2} />
                  <span lang="bn" className="text-[10px] font-bold leading-none">
                    লাইভ
                  </span>
                </Link>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="মেনু"
              className={cn("flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors", menuOpen ? "text-brand-300" : "text-ink-subtle active:text-ink")}
            >
              <Menu className="h-[22px] w-[22px]" strokeWidth={1.6} />
              <span lang="bn">মেনু</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
