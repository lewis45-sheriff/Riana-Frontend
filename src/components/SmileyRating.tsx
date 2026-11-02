"use client";

import { cn } from "@/lib/utils";

/**
 * Reactive 1-5 rating. Each option is a smiley that changes face as you tap,
 * with big thumb-sized targets (mobile-first). Fully keyboard accessible via
 * a radiogroup.
 */

const FACES: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😠", label: "Terrible" },
  { value: 2, emoji: "🙁", label: "Poor" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😍", label: "Loved it" },
];

interface SmileyRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export function SmileyRating({
  value,
  onChange,
  lowLabel = "Not great",
  highLabel = "Loved it",
}: Readonly<SmileyRatingProps>) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Rating from 1 to 5"
        className="flex items-center justify-between gap-2 sm:gap-3"
      >
        {FACES.map((face) => {
          const selected = value === face.value;
          return (
            <button
              key={face.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${face.value} — ${face.label}`}
              onClick={() => onChange(face.value)}
              className={cn(
                "group relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 sm:h-[72px] sm:w-[72px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                selected
                  ? "border-primary bg-primary-light scale-110 shadow-md"
                  : "border-border bg-surface hover:border-border-hover hover:scale-105",
              )}
            >
              <span
                className={cn(
                  "text-3xl transition-transform duration-200 sm:text-4xl",
                  selected ? "grayscale-0 scale-110" : "grayscale group-hover:grayscale-0",
                )}
                aria-hidden
              >
                {face.emoji}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-semibold tabular-nums",
                  selected ? "text-primary" : "text-muted",
                )}
              >
                {face.value}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
