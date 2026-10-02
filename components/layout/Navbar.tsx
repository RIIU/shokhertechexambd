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

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (isFocusRoute(pathname)) return null;

  // Longest matching prefix wins, so /ssc/science highlights "বিষয়সমূহ" only.
  const activeHref = LINKS.map((l) => l.href)
    .filter((href) => (href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
          scrolled ? "glass shadow-card" : "border border-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400 font-display text-sm font-black text-forest shadow-glow">
            ST
          </span>
          <span className="font-display text-base font-bold tracking-tight text-ink">
            ShokherTech<span className="text-brand-400">.</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === activeHref;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  lang="bn"
                  className={cn(
                    "relative rounded-xl px-3.5 py-2 text-sm transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/exam/ssc-physics-live-01" className="btn-primary hidden py-2 sm:inline-flex">
            <Radio className="h-4 w-4" strokeWidth={1.5} />
            <span lang="bn">লাইভ পরীক্ষা</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
            className="rounded-xl p-2 text-ink-muted hover:bg-white/5 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 max-w-7xl rounded-2xl p-2 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} lang="bn" className="block rounded-xl px-4 py-3 text-ink-muted hover:bg-white/5 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/exam/ssc-physics-live-01" lang="bn" className="btn-primary mt-1 w-full">
                লাইভ পরীক্ষা
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
