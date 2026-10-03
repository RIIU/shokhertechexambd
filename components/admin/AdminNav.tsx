"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileQuestion, Gauge, ListChecks, ShieldAlert, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "ওভারভিউ", icon: Gauge },
  { href: "/admin/exams", label: "পরীক্ষা ও প্রশ্ন", icon: FileQuestion },
  { href: "/admin/students", label: "শিক্ষার্থী", icon: Users },
  { href: "/admin/attempts", label: "ফলাফল", icon: ListChecks },
  { href: "/admin/alerts", label: "অ্যান্টি-চিট লগ", icon: ShieldAlert },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-2 lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                  active ? "bg-brand-400 font-semibold text-forest" : "text-ink-muted hover:bg-surface-pill hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span lang="bn">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
