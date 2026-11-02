"use client";

import { ArrowLeft, Mail, Phone, RefreshCw, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

  // Send-email composer state.
  const [draft, setDraft] = useState("");
  const [action, setAction] = useState<"draft" | "send" | null>(null);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);

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

  const generate = async () => {
    setAction("draft");
    try {
      const { draft } = await api.draftResponseEmail(id);
      setDraft(draft);
    } finally {
      setAction(null);
    }
  };

  const send = async () => {
    setAction("send");
    setSendResult(null);
    try {
      const r = await api.sendResponseEmail(id, draft || undefined);
      if (r.status === "sent") setSendResult({ ok: true, text: `Email sent to ${r.to}.` });
      else if (r.status === "logged")
        setSendResult({ ok: true, text: "Email logged (SMTP not configured)." });
      else setSendResult({ ok: false, text: r.reason || "Could not send email." });
    } catch {
      setSendResult({ ok: false, text: "Failed to send email." });
    } finally {
      setAction(null);
    }
  };

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

          {/* Send email — works for any rating */}
          <Card>
            <CardHeader>
              <CardTitle>Send an email</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                icon={Sparkles}
                loading={action === "draft"}
                disabled={action !== null}
                onClick={generate}
              >
                Generate with AI
              </Button>
            </CardHeader>
            <CardBody>
              {!response.customer.email ? (
                <p className="text-sm text-muted">
                  This respondent didn&apos;t leave an email address, so we can&apos;t email them.
                </p>
              ) : (
                <>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={8}
                    placeholder="Write a message, or click “Generate with AI” for a draft…"
                    className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      loading={action === "send"}
                      disabled={action !== null || !draft.trim()}
                      onClick={send}
                    >
                      Send to {response.customer.email}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={RefreshCw}
                      loading={action === "draft"}
                      disabled={action !== null}
                      onClick={generate}
                    >
                      Regenerate
                    </Button>
                  </div>
                  {sendResult && (
                    <p
                      className={`mt-3 rounded-md px-3 py-2 text-sm ${
                        sendResult.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                      }`}
                    >
                      {sendResult.text}
                    </p>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
