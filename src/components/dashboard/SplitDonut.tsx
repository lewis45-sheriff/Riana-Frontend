"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Split } from "@/lib/api";

interface SplitDonutProps {
  split: Split;
}

const COLORS = {
  promoter: "var(--success)",
  passive: "var(--warning)",
  detractor: "var(--danger)",
};

export function SplitDonut({ split }: Readonly<SplitDonutProps>) {
  const data = [
    { name: "Promoters", key: "promoter", value: split.promoter },
    { name: "Passives", key: "passive", value: split.passive },
    { name: "Detractors", key: "detractor", value: split.detractor },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={COLORS[d.key as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted">total</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[d.key as keyof typeof COLORS] }}
              />
              <span className="text-text-secondary">{d.name}</span>
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {d.value}
              <span className="ml-1 text-xs text-muted">
                ({total ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
