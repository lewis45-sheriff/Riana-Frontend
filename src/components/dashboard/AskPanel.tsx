"use client";

import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { api, type AskResult } from "@/lib/api";

const SUGGESTIONS = [
  "How did customer care do last week?",
  "What's our product score this month?",
  "How happy were customers this week?",
];

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    try {
      setResult(await api.ask(query));
    } catch {
      setResult({
        answer: "Sorry, I couldn't answer that right now. The dashboard data is still available below.",
        chart: null,
        degraded: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <h3 className="font-display font-semibold text-foreground">Ask the dashboard</h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your feedback in plain English…"
          className="h-10 flex-1 rounded-(--r-input) border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <Button type="submit" icon={Send} loading={loading} disabled={!question.trim()}>
          Ask
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
            className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-hover hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      {result && (
        <div className="animate-fade-in mt-4 rounded-md border border-border bg-bg p-4">
          <p className="text-sm leading-relaxed text-foreground">{result.answer}</p>
          {result.degraded && (
            <p className="mt-2 text-xs text-muted">
              AI is running in fallback mode — this answer is computed directly from your data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
