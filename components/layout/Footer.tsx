"use client";

import { usePathname } from "next/navigation";
import { isFocusRoute } from "@/lib/routes";

export function Footer() {
  const pathname = usePathname();
  if (isFocusRoute(pathname)) return null;

  return (
    <footer className="mt-24 border-t border-surface-border bg-section">
      <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-ink-subtle sm:flex-row">
        <p>
          © {new Date().getFullYear()} ShokherTech Exam BD.{" "}
          <span lang="bn">এসএসসি ও এইচএসসি শিক্ষার্থীদের জন্য।</span>
        </p>
        <p className="font-display text-xs tracking-wide">Built with Next.js · Tailwind · GSAP</p>
      </div>
    </footer>
  );
}
