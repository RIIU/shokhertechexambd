"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, LogOut, Menu, Radio, UserPlus, X } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useAppShell } from "./AppShell";
import { isFocusRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/ssc", label: "এসএসসি" },
  { href: "/hsc", label: "এইচএসসি" },
  { href: "/ssc/science", label: "বিষয়সমূহ" },
];

/**
 * Full-width header modelled on pixxen.com: solid #012819 bar with a #065136
 * bottom border, a dark-green menu cell on the left (mobile) and a flush lime
 * call-to-action block on the right. On phones the menu button opens
 * <MobileMenu />, and <MobileTabBar /> adds bottom navigation.
 */
export function Navbar() {
  const pathname = usePathname();
  const { user, loading, menuOpen, setMenuOpen } = useAppShell();
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
          {/* Account: pixxen's outlined "Client Portal" slot */}
          {!loading && (
            <div className="hidden items-stretch md:flex">
              {user ? (
                <>
                  <Link
                    href={home.href}
                    className="flex items-center gap-2 border-l border-forest px-5 text-sm text-ink transition-colors hover:bg-surface-pill"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-brand-300">
                      {user.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span lang="bn">{home.label}</span>
                  </Link>
                  <form action={logoutAction} className="flex">
                    <button
                      type="submit"
                      aria-label="Log out"
                      title="লগআউট"
                      className="flex items-center border-l border-forest px-4 text-ink-muted transition-colors hover:bg-surface-pill hover:text-ink"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </>
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
