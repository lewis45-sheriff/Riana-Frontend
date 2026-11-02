"use client";

import { useEffect, useState } from "react";
import { ResponsesTable } from "@/components/dashboard/ResponsesTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { StatCard } from "@/components/ui/StatCard";
import { type DashboardSummary, api } from "@/lib/api";

type Filter = "all" | "promoter" | "passive" | "detractor";

export default function ResponsesPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) {
        void api
          .dashboard(14)
          .then((s) => active && setSummary(s))
          .catch(() => {});
      }
    };
    run();
    const id = setInterval(run, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const split = summary?.split;

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-foreground">Responses</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Every piece of feedback, product · care · happiness.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total respondents" value={summary?.total_respondents ?? "—"} sub="All time" />
        <StatCard
          label="Average score"
          value={summary?.average_mean ?? "—"}
          tone="accent"
          sub="Mean of all responses"
        />
        <StatCard label="Promoters" value={split?.promoter ?? "—"} tone="success" sub="Score above 3" />
        <StatCard label="Detractors" value={split?.detractor ?? "—"} tone="danger" sub="Score below 3" />
      </div>

      {/* Filter tabs */}
      <FilterTabs
        className="mb-4"
        active={filter}
        onChange={(k) => setFilter(k as Filter)}
        tabs={[
          { key: "all", label: "All", count: summary?.total_respondents },
          { key: "promoter", label: "Promoters", count: split?.promoter },
          { key: "passive", label: "Passives", count: split?.passive },
          { key: "detractor", label: "Detractors", count: split?.detractor },
        ]}
      />

      <ResponsesTable filter={filter} />
    </div>
  );
}
