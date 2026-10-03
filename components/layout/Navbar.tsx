"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Radio, X } from "lucide-react";
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
 * call-to-action block on the right.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

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
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex w-14 items-center justify-center bg-forest text-ink transition-colors hover:bg-leaf-600 sm:w-16 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

        <Link
          href="/exam/ssc-physics-live-01"
          className="flex items-center gap-2 bg-brand-400 px-4 text-sm font-semibold text-forest transition-colors hover:bg-brand-300 sm:px-6 lg:px-10"
        >
          <Radio className="h-4 w-4" strokeWidth={1.75} />
          <span lang="bn">লাইভ পরীক্ষা</span>
        </Link>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-surface-border bg-obsidian-800 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-surface-border last:border-b-0">
                <Link href={l.href} lang="bn" className="block px-5 py-4 text-ink-muted hover:bg-surface-pill hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
