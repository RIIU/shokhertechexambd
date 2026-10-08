import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

/** Centered card on pixxen's popup gradient, shared by login and register. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-radial-brand" />
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-surface-border bg-radial-forest p-6 shadow-card sm:p-8">
          <Link href="/" className="mb-6 inline-flex items-center" aria-label="Shokher Tech Academy — হোম">
            <BrandLogo className="h-9" priority />
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
