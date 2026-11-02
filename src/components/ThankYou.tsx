"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CONFETTI_COLORS = ["#174EA6", "#FF6B00", "#16A34A", "#2563EB", "#FFCA20"];

interface ThankYouProps {
  message: string;
  onRestart: () => void;
}

export function ThankYou({ message, onRestart }: Readonly<ThankYouProps>) {
  return (
    <div className="relative flex flex-col items-center py-6 text-center">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 h-2 w-2 rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confetti-fall ${1 + (i % 5) * 0.3}s ease-in ${(i % 7) * 0.12}s forwards`,
            }}
          />
        ))}
      </div>

      <div className="animate-pop-in mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-bg">
        <CheckCircle2 size={44} className="text-success" strokeWidth={2.2} />
      </div>
      <h2 className="animate-slide-up font-display text-2xl font-bold text-foreground">
        Thank you!
      </h2>
      <p className="animate-slide-up mt-2 max-w-sm text-text-secondary">{message}</p>
      <Button variant="secondary" className="animate-slide-up mt-6" onClick={onRestart}>
        Submit another response
      </Button>
    </div>
  );
}
