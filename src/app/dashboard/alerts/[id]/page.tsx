"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/button-styles";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ApiError, type Alert, api } from "@/lib/api";

const QUESTIONS = [
  { key: "q1", label: "Product experience" },
  { key: "q2", label: "Customer care" },
  { key: "q3", label: "Happy with product" },
] as const;

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [alert, setAlert] = useState<Alert | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Which action is currently running (so only that button spins).
  const [action, setAction] = useState<"email" | "sms" | "regenerate" | "ack" | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);

  const busy = action !== null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const a = await api.getAlert(id);
      setAlert(a);
      setDraft(a.ai_draft ?? "");
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError("This alert was not found.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load alert");
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

  const regenerate = async () => {
    setAction("regenerate");
    try {
      const { draft } = await api.regenerateDraft(id);
      setDraft(draft);
    } finally {
      setAction(null);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const acknowledge = async () => {
    setAction("ack");
    try {
      const updated = await api.ackAlert(id);
      setAlert(updated);
    } finally {
      setAction(null);
    }
  };

  const sendEmail = async () => {
    setAction("email");
    setSendResult(null);
    try {
      const r = await api.sendAlertEmail(id, draft);
      if (r.status === "sent") {
        setSendResult({ ok: true, text: `Email sent to ${r.to}.` });
      } else if (r.status === "logged") {
        setSendResult({ ok: true, text: "Email logged (SMTP not configured)." });
      } else {
        setSendResult({ ok: false, text: r.reason || "Could not send email." });
      }
      await load();
    } catch {
      setSendResult({ ok: false, text: "Failed to send email." });
    } finally {
      setAction(null);
    }
  };

  const sendSms = async () => {
    setAction("sms");
    setSendResult(null);
    try {
      const r = await api.sendAlertSms(id, draft);
      const successMessage: Record<string, string> = {
        mock: `SMS logged in mock mode (would text ${r.to}).`,
        queued: `SMS queued in the Android gateway for ${r.to}. Check the phone's outgoing queue to confirm delivery.`,
        accepted: `SMS accepted by the provider for ${r.to}. Provider acceptance does not confirm delivery.`,
        sent: `SMS sent to ${r.to}.`,
      };
      if (successMessage[r.status]) {
        setSendResult({
          ok: true,
          text: successMessage[r.status],
        });
      } else {
        setSendResult({
          ok: false,
          text: r.reason || r.provider?.error || "Could not send SMS.",
        });
      }
      await load();
    } catch {
      setSendResult({ ok: false, text: "Failed to send SMS." });
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <Link href="/dashboard/alerts" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          <ArrowLeft size={15} />
          Back to alerts
        </Link>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-(--r-card) border border-border bg-surface" />
      ) : error ? (
        <div className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      ) : alert ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {alert.customer.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                {alert.customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} /> {alert.customer.email}
                  </span>
                )}
                {alert.customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} /> {alert.customer.phone}
                  </span>
                )}
                <span>{new Date(alert.created_at).toLocaleString()}</span>
              </div>
            </div>
            {alert.status === "new" ? (
              <Badge variant="danger" dot>
                Open
              </Badge>
            ) : (
              <Badge variant="success" dot>
                Acknowledged
              </Badge>
            )}
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Mean score" value={alert.response.mean} tone="danger" sub="Below 3" />
            {QUESTIONS.map((q) => (
              <StatCard
                key={q.key}
                label={q.label}
                value={alert.response[q.key as "q1" | "q2" | "q3"]}
                sub="out of 5"
              />
            ))}
          </div>

          {alert.response.comment && (
            <Card>
              <CardHeader>
                <CardTitle>Customer comment</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed text-foreground">
                  “{alert.response.comment}”
                </p>
              </CardBody>
            </Card>
          )}

          {/* AI draft */}
          <Card>
            <CardHeader>
              <CardTitle>AI-drafted follow-up</CardTitle>
              <span className="text-xs text-muted">Edit before sending</span>
            </CardHeader>
            <CardBody>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={8}
                className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              {/* Send actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  loading={action === "email"}
                  disabled={busy || !alert.customer.email || !draft.trim()}
                  onClick={sendEmail}
                >
                  Send by email
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  icon={MessageSquare}
                  loading={action === "sms"}
                  disabled={busy || !alert.customer.phone || !draft.trim()}
                  onClick={sendSms}
                >
                  Send by SMS
                </Button>
                <span className="flex-1" />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={copied ? Check : Copy}
                  disabled={busy}
                  onClick={copy}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  loading={action === "regenerate"}
                  disabled={busy}
                  onClick={regenerate}
                >
                  Regenerate
                </Button>
                {alert.status === "new" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Check}
                    loading={action === "ack"}
                    disabled={busy}
                    onClick={acknowledge}
                  >
                    Mark handled
                  </Button>
                )}
              </div>

              {!alert.customer.phone && (
                <p className="mt-2 text-xs text-muted">
                  SMS is unavailable — this customer has no phone number on file.
                </p>
              )}

              {sendResult && (
                <p
                  className={`mt-3 rounded-md px-3 py-2 text-sm ${
                    sendResult.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                  }`}
                >
                  {sendResult.text}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
