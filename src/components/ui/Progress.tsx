import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  tone?: "primary" | "accent" | "success";
}

const toneClass = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
};

export function ProgressBar({ value, className, tone = "primary" }: Readonly<ProgressBarProps>) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-border", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", toneClass[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
