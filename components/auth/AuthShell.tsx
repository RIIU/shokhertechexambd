import Link from "next/link";
import type { ReactNode } from "react";

/** Centered card on pixxen's popup gradient, shared by login and register. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-brand" />
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-surface-border bg-radial-forest p-6 shadow-card sm:p-8">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-400 font-display text-sm font-black text-forest">ST</span>
            <span className="font-display font-bold text-ink">ShokherTech<span className="text-brand-400">.</span></span>
          </Link>
          <h1 lang="bn" className="mb-1 text-2xl font-bold text-ink">
            {title}
          </h1>
          <p lang="bn" className="mb-6 text-sm text-ink-muted">
            {subtitle}
          </p>
          {children}
        </div>
        <p lang="bn" className="mt-5 text-center text-sm text-ink-muted">
          {footer}
        </p>
      </div>
    </main>
  );
}
