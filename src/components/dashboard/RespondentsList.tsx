"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { FeedbackResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RespondentsListProps {
  responses: FeedbackResponse[];
}

const QLABELS = ["Product", "Care", "Happy"];

export function RespondentsList({ responses }: Readonly<RespondentsListProps>) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (responses.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No responses yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {responses.map((r) => {
        const isOpen = openId === r.id;
        const scores = [r.q1, r.q2, r.q3];
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : r.id)}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {r.customer.name}
                </span>
                <span className="block truncate text-xs text-muted">
                  {new Date(r.created_at).toLocaleDateString()} · {r.source}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-display font-semibold tabular-nums text-foreground">
                  {r.mean}
                </span>
                <Badge variant={r.classification}>{r.classification}</Badge>
                <ChevronDown
                  size={16}
                  className={cn("text-muted transition-transform", isOpen && "rotate-180")}
                />
              </span>
            </button>
            {isOpen && (
              <div className="animate-fade-in pb-3">
                <div className="grid grid-cols-3 gap-2">
                  {scores.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border bg-bg p-2 text-center"
                    >
                      <div className="text-[11px] uppercase tracking-wide text-muted">
                        {QLABELS[i]}
                      </div>
                      <div className="font-display text-lg font-semibold tabular-nums text-foreground">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
                {r.comment && (
                  <p className="mt-2 rounded-md bg-bg p-2 text-sm text-text-secondary">
                    “{r.comment}”
                  </p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
