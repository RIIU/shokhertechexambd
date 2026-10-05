"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, MinusCircle, XCircle, type LucideIcon } from "lucide-react";
import { toBn } from "@/lib/utils";
import type { ExamResult } from "@/lib/types";

/*
 * Status colors (good / critical / neutral) on the white card: green and rose
 * clear 3:1; the neutral gray is lighter, so every slice also carries an icon
 * + text label and a 2px white gap between slices.
 */
const STATUS: { key: "correct" | "wrong" | "skipped"; label: string; color: string; icon: LucideIcon }[] = [
  { key: "correct", label: "সঠিক", color: "#12B76A", icon: CheckCircle2 },
  { key: "wrong", label: "ভুল", color: "#E11D48", icon: XCircle },
  { key: "skipped", label: "উত্তর দেওয়া হয়নি", color: "#D0D5DD", icon: MinusCircle },
];
const SURFACE = "#FFFFFF";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[] }) {
  const p = payload?.[0];
  if (!active || !p) return null;
  const extra = p.payload?.detail as string | undefined;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-card">
      <p lang="bn" className="font-semibold text-ink">
        {p.name}
      </p>
      <p lang="bn" className="text-ink-muted">
        {extra ?? toBn(p.value ?? 0)}
      </p>
    </div>
  );
}

export function AccuracyDonut({ result }: { result: ExamResult }) {
  const data = STATUS.map((s) => ({ name: s.label, value: result[s.key], color: s.color }));
  return (
    <figure className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke={SURFACE}
              strokeWidth={2}
              cornerRadius={4}
              isAnimationActive
              animationDuration={900}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span lang="bn" className="font-display text-3xl font-bold text-ink">
            {toBn(result.accuracy)}%
          </span>
          <span lang="bn" className="text-xs text-ink-muted">
            নির্ভুলতা
          </span>
        </div>
      </div>
      <figcaption className="w-full">
        <ul className="space-y-2">
          {STATUS.map(({ key, label, color, icon: Icon }) => (
            <li key={key} className="flex items-center justify-between gap-4 rounded-xl border border-surface-border px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <Icon className="h-4 w-4" style={{ color: key === "skipped" ? "#98A2B3" : color }} strokeWidth={1.75} />
                <span lang="bn">{label}</span>
              </span>
              <span lang="bn" className="font-display text-lg font-bold text-ink">
                {toBn(result[key])}
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export function TopicBars({ result }: { result: ExamResult }) {
  const data = result.topics.map((t) => ({
    name: t.topic,
    value: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    detail: `${toBn(t.correct)}/${toBn(t.total)} সঠিক · ${toBn(t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0)}%`,
  }));
  return (
    <figure>
      {/* SVG tick labels inherit the Bangla font stack from this wrapper. */}
      <div className="font-bangla" style={{ height: Math.max(120, data.length * 56) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={14}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475467", fontSize: 13 }}
            />
            <Tooltip cursor={{ fill: "rgba(16,24,40,0.03)" }} content={<ChartTooltip />} />
            <Bar
              dataKey="value"
              name="সঠিক উত্তরের হার"
              fill="#12B76A"
              radius={[0, 4, 4, 0]}
              background={{ fill: "#F2F4F7", radius: 4 }}
              label={{ position: "right", fill: "#344054", fontSize: 12, formatter: (v: number) => `${toBn(v)}%` }}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption lang="bn" className="mt-2 text-xs text-ink-subtle">
        প্রতিটি টপিকে সঠিক উত্তরের হার (%)
      </figcaption>
    </figure>
  );
}
