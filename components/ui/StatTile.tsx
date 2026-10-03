import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** KPI tile: label, big value, optional hint. Text stays in ink colors; the icon carries the accent. */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "brand" | "leaf" | "danger" | "amber";
}) {
  const toneCls = {
    brand: "bg-brand-400/10 text-brand-400 ring-brand-400/25",
    leaf: "bg-leaf-400/10 text-leaf-400 ring-leaf-400/25",
    danger: "bg-state-danger/10 text-rose-300 ring-state-danger/30",
    amber: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  }[tone];
  return (
    <div className="rounded-3xl border border-surface-border bg-obsidian-900 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", toneCls)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
        <span lang="bn" className="text-sm text-ink-muted">
          {label}
        </span>
      </div>
      <p lang="bn" className="font-display text-3xl font-bold text-ink">
        {value}
      </p>
      {hint && (
        <p lang="bn" className="mt-1 text-xs text-ink-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-surface-border bg-obsidian-900 p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 lang="bn" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border px-4 py-10 text-center">
      <p lang="bn" className="mb-4 text-sm text-ink-muted">
        {text}
      </p>
      {action}
    </div>
  );
}
