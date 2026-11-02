/**
 * Client-side helpers that mirror the backend scoring rules and shape chart
 * data. Kept pure so they're easy to unit-test.
 */

import type { TrendPoint } from "@/lib/api";

export type Classification = "detractor" | "passive" | "promoter";

/** Mirror of the backend rule: mean<3 detractor, ==3.00 passive, >3 promoter. */
export function classify(mean: number): Classification {
  const rounded = Math.round(mean * 100) / 100;
  if (rounded < 3) return "detractor";
  if (rounded === 3) return "passive";
  return "promoter";
}

export function mean(q1: number, q2: number, q3: number): number {
  return Math.round(((q1 + q2 + q3) / 3) * 100) / 100;
}

export interface TrendSeriesPoint {
  date: string;
  actual: number | null;
  projected: number | null;
}

/**
 * Split a trend into actual (solid) and projected (dashed) series on one axis.
 * The projected series starts at the last actual point so the lines join.
 */
export function toTrendSeries(trend: TrendPoint[]): TrendSeriesPoint[] {
  const firstProjectedIndex = trend.findIndex((p) => p.projected);
  return trend.map((p, i) => {
    const isProjected = p.projected;
    const isLastActual = firstProjectedIndex > 0 && i === firstProjectedIndex - 1;
    return {
      date: p.date.slice(5),
      actual: isProjected ? null : p.mean,
      projected: isProjected || isLastActual ? p.mean : null,
    };
  });
}
