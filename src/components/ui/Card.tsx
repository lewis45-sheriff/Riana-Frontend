import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export function Card({
  className,
  children,
  interactive,
  selected,
  ...props
}: Readonly<CardProps>) {
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        "bg-surface border border-border rounded-(--r-card) overflow-hidden shadow-sm",
        interactive &&
          "transition-shadow transition-colors hover:border-border-hover hover:shadow-md focus-within:border-primary",
        selected && "border-primary bg-primary-light",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-border flex items-center justify-between gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn("flex-1 font-display text-base font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}
