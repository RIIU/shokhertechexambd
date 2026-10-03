"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toBn } from "@/lib/utils";

interface Point {
  n: number;
  percent: number;
  title: string;
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload?: Point }[] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="glass max-w-[220px] rounded-xl px-3 py-2 text-xs shadow-card">
      <p lang="bn" className="truncate font-semibold text-ink">
        {p.title}
      </p>
      <p lang="bn" className="text-ink-muted">
        স্কোর {toBn(p.percent)}%
      </p>
    </div>
  );
}

/** Single series (score % per exam, oldest → newest): no legend needed, the panel title names it. */
export function ScoreTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full font-bangla">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#29473C" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="n" tickLine={false} axisLine={false} tick={{ fill: "#759187", fontSize: 12 }} tickFormatter={(v: number) => toBn(v)} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#759187", fontSize: 12 }}
            tickFormatter={(v: number) => `${toBn(v)}%`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#A7BDB5", strokeOpacity: 0.3 }} />
          <Line
            type="monotone"
            dataKey="percent"
            stroke="#99FE00"
            strokeWidth={2}
            dot={{ r: 4, fill: "#99FE00", stroke: "#002417", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#99FE00", stroke: "#002417", strokeWidth: 2 }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
