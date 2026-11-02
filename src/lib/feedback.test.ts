import { describe, expect, it } from "vitest";
import type { TrendPoint } from "@/lib/api";
import { classify, mean, toTrendSeries } from "@/lib/feedback";

describe("scoring (client mirror of backend rules)", () => {
  it("computes a 2dp mean", () => {
    expect(mean(2, 3, 2)).toBe(2.33);
    expect(mean(5, 5, 5)).toBe(5);
  });

  it("classifies below 3 as detractor", () => {
    expect(classify(2.33)).toBe("detractor");
    expect(classify(2.99)).toBe("detractor");
  });

  it("classifies exactly 3.00 as passive", () => {
    expect(classify(3)).toBe("passive");
    expect(classify(mean(2, 4, 3))).toBe("passive");
  });

  it("classifies above 3 as promoter", () => {
    expect(classify(3.33)).toBe("promoter");
    expect(classify(5)).toBe("promoter");
  });
});

describe("toTrendSeries", () => {
  it("splits actual and projected and joins at the last actual point", () => {
    const trend: TrendPoint[] = [
      { date: "2026-01-01", mean: 3.0, count: 2, projected: false },
      { date: "2026-01-02", mean: 3.5, count: 3, projected: false },
      { date: "2026-01-03", mean: 3.8, count: 0, projected: true },
    ];
    const series = toTrendSeries(trend);
    expect(series[0]).toEqual({ date: "01-01", actual: 3.0, projected: null });
    // last actual carries a projected value so the dashed line connects
    expect(series[1]).toEqual({ date: "01-02", actual: 3.5, projected: 3.5 });
    expect(series[2]).toEqual({ date: "01-03", actual: null, projected: 3.8 });
  });

  it("handles an all-actual trend", () => {
    const trend: TrendPoint[] = [
      { date: "2026-01-01", mean: 3.0, count: 2, projected: false },
    ];
    const series = toTrendSeries(trend);
    expect(series[0].projected).toBeNull();
  });
});
