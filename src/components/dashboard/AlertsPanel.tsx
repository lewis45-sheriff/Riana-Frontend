"use client";

import { Check, Copy, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, type Alert } from "@/lib/api";

interface AlertsPanelProps {
  alerts: Alert[];
  onChange: () => void;
}

export function AlertsPanel({ alerts, onChange }: Readonly<AlertsPanelProps>) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const draftFor = (a: Alert) => drafts[a.id] ?? a.ai_draft ?? "";

  const ack = async (id: number) => {
    setBusy(id);
    try {
      await api.ackAlert(id);
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async (id: number) => {
    setBusy(id);
    try {
      const { draft } = await api.regenerateDraft(id);
      setDrafts((d) => ({ ...d, [id]: draft }));
    } finally {
      setBusy(null);
    }
  };

  const copy = async (id: number) => {
    await navigator.clipboard.writeText(draftFor(alerts.find((a) => a.id === id)!));
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (alerts.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No detractor alerts. Everyone&apos;s happy right now.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {alerts.map((a) => {
        const isOpen = openId === a.id;
        return (
          <li key={a.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : a.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {a.customer.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {a.customer.email || a.customer.phone || "no contact"} · mean{" "}
                    {a.response.mean}
                  </span>
                </span>
              </button>
              <div className="flex items-center gap-2">
                {a.status === "new" ? (
                  <Badge variant="danger" dot>
                    New
                  </Badge>
                ) : (
                  <Badge variant="success" dot>
                    Acknowledged
                  </Badge>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="animate-fade-in mt-3 rounded-md border border-border bg-bg p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <Mail size={13} />
                  AI-drafted follow-up (edit before sending)
                </div>
                <textarea
                  value={draftFor(a)}
                  onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-border bg-surface p-2 text-sm text-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={copied === a.id ? Check : Copy}
                    onClick={() => copy(a.id)}
                  >
                    {copied === a.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={RefreshCw}
                    loading={busy === a.id}
                    onClick={() => regenerate(a.id)}
                  >
                    Regenerate
                  </Button>
                  {a.status === "new" && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Check}
                      loading={busy === a.id}
                      onClick={() => ack(a.id)}
                    >
                      Mark handled
                    </Button>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
