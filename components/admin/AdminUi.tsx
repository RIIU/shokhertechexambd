import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 lang="bn" className="text-2xl font-bold text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p lang="bn" className="mt-1 text-sm text-ink-muted">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

/** Responsive table wrapper: scrolls sideways on phones instead of breaking the page. */
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border text-xs text-ink-subtle">
            {head.map((h) => (
              <th key={h} lang="bn" scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">{children}</tbody>
      </table>
      {empty && (
        <p lang="bn" className="px-4 py-10 text-center text-sm text-ink-muted">
          {empty}
        </p>
      )}
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "brand" | "danger" | "amber" | "leaf" }) {
  const cls = {
    muted: "bg-surface-pill text-ink-muted",
    brand: "bg-brand-400/15 text-brand-300",
    leaf: "bg-leaf-400/15 text-leaf-300",
    danger: "bg-state-danger/15 text-rose-300",
    amber: "bg-amber-400/15 text-amber-300",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}
