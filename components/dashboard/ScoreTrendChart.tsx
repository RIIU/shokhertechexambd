"use client";

import { memo, Suspense, lazy } from "react";
import { toBn } from "@/lib/utils";

interface Point {
  n: number;
  percent: number;
  title: string;
}

// Lazy-load the heavy recharts bundle — only pulled when this component mounts.
const LazyChart = lazy(() => import("./ScoreTrendChartInner"));

/** Single series (score % per exam, oldest → newest): no legend needed, the panel title names it. */
export const ScoreTrendChart = memo(function ScoreTrendChart({ data }: { data: Point[] }) {
  return (
    <Suspense fallback={<div className="flex h-56 items-center justify-center text-ink-subtle text-sm">লোড হচ্ছে…</div>}>
      <LazyChart data={data} />
    </Suspense>
  );
});
