import { cn } from "@/lib/utils";

type StatTone = "primary" | "accent" | "success" | "warning" | "danger";

const toneValue: Record<StatTone, string> = {
  primary: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: StatTone;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  tone = "primary",
  icon,
  className,
}: Readonly<StatCardProps>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-(--r-card) border border-border bg-surface p-5 shadow-sm",
        className,
      )}
    >
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.6px] text-muted">
          {label}
        </span>
        <span
          className={cn(
            "block font-display text-[26px] font-semibold leading-none tracking-tight tabular-nums",
            toneValue[tone],
          )}
        >
          {value}
        </span>
        {sub && <span className="mt-2 block truncate text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}
