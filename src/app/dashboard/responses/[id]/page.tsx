"use client";

import { ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/button-styles";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ApiError, type FeedbackResponse, api } from "@/lib/api";

const QUESTIONS = [
  { key: "q1", label: "Product experience" },
  { key: "q2", label: "Customer care" },
  { key: "q3", label: "Happy with product" },
] as const;

export default function ResponseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [response, setResponse] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResponse(await api.getResponse(id));
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError("This response was not found.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load response");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const run = () => active && void load();
    run();
    return () => {
      active = false;
    };
  }, [load]);

  const verdictTone =
    response?.classification === "promoter"
      ? "success"
      : response?.classification === "detractor"
        ? "danger"
        : "warning";

  return (
    <div className="w-full">
      <div className="mb-5">
        <Link href="/dashboard/responses" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          <ArrowLeft size={15} />
          Back to responses
        </Link>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-(--r-card) border border-border bg-surface" />
      ) : error ? (
        <div className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      ) : response ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {response.customer.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                {response.customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} /> {response.customer.email}
                  </span>
                )}
                {response.customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} /> {response.customer.phone}
                  </span>
                )}
                <span>
                  {new Date(response.created_at).toLocaleString()} · {response.source}
                </span>
              </div>
            </div>
            <Badge variant={response.classification}>{response.classification}</Badge>
          </div>

          {/* Score summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Mean score" value={response.mean} tone={verdictTone} sub="Average of 3" />
            {QUESTIONS.map((q) => (
              <StatCard
                key={q.key}
                label={q.label}
                value={response[q.key as "q1" | "q2" | "q3"]}
                sub="out of 5"
              />
            ))}
          </div>

          {/* Comment */}
          <Card>
            <CardHeader>
              <CardTitle>Comment</CardTitle>
            </CardHeader>
            <CardBody>
              {response.comment ? (
                <p className="text-sm leading-relaxed text-foreground">“{response.comment}”</p>
              ) : (
                <p className="text-sm text-muted">No comment left.</p>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
