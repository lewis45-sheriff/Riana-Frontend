"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/api";
import { toTrendSeries } from "@/lib/feedback";

interface TrendChartProps {
  trend: TrendPoint[];
}

export function TrendChart({ trend }: Readonly<TrendChartProps>) {
  // Split actual vs projected so the projection renders as a dashed line that
  // joins the last actual point. (See toTrendSeries for the logic + tests.)
  const data = toTrendSeries(trend);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--text)",
            }}
            labelStyle={{ color: "var(--muted)" }}
          />
          <ReferenceLine y={3} stroke="var(--warning)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="actual"
            name="Score"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--primary)" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projection"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
