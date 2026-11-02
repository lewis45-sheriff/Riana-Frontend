import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "destructive"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 min-h-8 px-2.5 text-sm gap-1.5",
  md: "h-9 min-h-9 px-3.5 text-sm gap-1.5",
  lg: "h-11 min-h-11 px-5 text-base gap-2",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover border-transparent",
  secondary: "bg-surface text-foreground hover:bg-bg border-border",
  accent: "bg-accent text-white hover:bg-accent-hover border-transparent",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg hover:text-foreground border-transparent",
  destructive: "bg-danger text-white hover:opacity-90 border-transparent",
  link: "bg-transparent text-primary hover:underline underline-offset-2 border-transparent h-auto px-0",
};

/**
 * Button styling as a standalone (server-safe) helper so links can look like
 * buttons without importing a client component.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "relative inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors",
    "cursor-pointer select-none active:scale-[0.97]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    variant !== "link" && sizeClasses[size],
    variantClasses[variant],
    className,
  );
}
