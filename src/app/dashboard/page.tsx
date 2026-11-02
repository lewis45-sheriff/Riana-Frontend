"use client";

import { AlertTriangle, BarChart3, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AskPanel } from "@/components/dashboard/AskPanel";
import { RespondentsList } from "@/components/dashboard/RespondentsList";
import { SplitDonut } from "@/components/dashboard/SplitDonut";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  type Alert,
  type DashboardSummary,
  type FeedbackResponse,
  api,
} from "@/lib/api";

const POLL_MS = 8000;

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, a, r] = await Promise.all([
        api.dashboard(14),
        api.listAlerts(),
        api.listResponses(50),
      ]);
      setSummary(s);
      setAlerts(a);
      setResponses(r);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) void load();
    };
    run();
    const id = setInterval(run, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Product, customer care and happiness at a glance.
        </p>
        {lastUpdated && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Live · {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total respondents"
          value={summary?.total_respondents ?? "—"}
          icon={<Users size={20} />}
          sub="All time"
        />
        <StatCard
          label="Average score"
          value={summary?.average_mean ?? "—"}
          tone="accent"
          icon={<BarChart3 size={20} />}
          sub="Mean of all responses"
        />
        <StatCard
          label="Open alerts"
          value={summary?.open_alerts ?? "—"}
          tone={summary && summary.open_alerts > 0 ? "danger" : "success"}
          icon={<AlertTriangle size={20} />}
          sub="Detractors to follow up"
        />
      </div>

      {/* AI ask */}
      <Card className="mt-4">
        <CardBody>
          <AskPanel />
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily trend &amp; projection</CardTitle>
            <span className="text-xs text-muted">Dashed = projected</span>
          </CardHeader>
          <CardBody>
            {summary ? (
              <TrendChart trend={summary.trend} />
            ) : (
              <div className="h-64 animate-pulse rounded bg-bg" />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Split</CardTitle>
          </CardHeader>
          <CardBody>
            {summary ? (
              <SplitDonut split={summary.split} />
            ) : (
              <div className="h-40 animate-pulse rounded bg-bg" />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Alerts + respondents */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detractor alerts</CardTitle>
            <span className="text-xs text-muted">{alerts.length} total</span>
          </CardHeader>
          <CardBody>
            <AlertsPanel alerts={alerts} onChange={load} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent respondents</CardTitle>
            <span className="text-xs text-muted">Tap to drill down</span>
          </CardHeader>
          <CardBody>
            <RespondentsList responses={responses} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
