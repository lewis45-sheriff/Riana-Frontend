"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { StatCard } from "@/components/ui/StatCard";
import { type Alert, api } from "@/lib/api";

type Filter = "all" | "new" | "acknowledged";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    try {
      setAlerts(await api.listAlerts());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => active && void load();
    run();
    const id = setInterval(run, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  const openCount = alerts.filter((a) => a.status === "new").length;
  const ackCount = alerts.filter((a) => a.status === "acknowledged").length;

  const visible = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((a) => a.status === filter);
  }, [alerts, filter]);

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-foreground">Detractor alerts</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Unhappy customers who need a follow-up, with AI-drafted replies.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard
          label="Open alerts"
          value={openCount}
          tone={openCount > 0 ? "danger" : "success"}
          sub="Awaiting follow-up"
        />
        <StatCard label="Acknowledged" value={ackCount} tone="success" sub="Handled by the team" />
        <StatCard label="Total detractors" value={alerts.length} sub="All time" />
      </div>

      {/* Filter tabs */}
      <FilterTabs
        className="mb-4"
        active={filter}
        onChange={(k) => setFilter(k as Filter)}
        tabs={[
          { key: "all", label: "All", count: alerts.length },
          { key: "new", label: "Open", count: openCount },
          { key: "acknowledged", label: "Acknowledged", count: ackCount },
        ]}
      />

      {error && (
        <div className="mb-4 rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <AlertsTable alerts={visible} loading={loading} />
    </div>
  );
}
