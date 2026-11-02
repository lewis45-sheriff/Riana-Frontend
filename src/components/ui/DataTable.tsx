"use client";

import { cn } from "@/lib/utils";

/**
 * Table primitives replicating the BodaPlus data-table look:
 * card wrapper, toolbar header, uppercase column heads, striped rows with a
 * left accent bar on hover/selection.
 */

export function DataTableRoot({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div className={cn("overflow-hidden rounded-(--r-card) border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

export function DataTableToolbar({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div
      className={cn(
        "flex min-h-14 flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTableTitle({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 truncate text-xs tabular-nums text-muted">{subtitle}</p>}
    </div>
  );
}

export function DataTable({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn("w-full border-collapse text-left", className)}>{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: Readonly<{ children: React.ReactNode }>) {
  return <thead className="bg-bg">{children}</thead>;
}

export function DataTableBody({ children }: Readonly<{ children: React.ReactNode }>) {
  return <tbody>{children}</tbody>;
}

export function DataTableHeaderCell({
  children,
  align = "left",
  className,
}: Readonly<{
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DataTableRow({
  children,
  onClick,
  selected,
  className,
}: Readonly<{
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}>) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "group relative border-t border-border transition-colors",
        !selected && "even:bg-bg hover:bg-primary-light",
        selected && "bg-primary-light before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  align = "left",
  numeric,
  colSpan,
  className,
}: Readonly<{
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  numeric?: boolean;
  colSpan?: number;
  className?: string;
}>) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3",
        align === "right" && "text-right",
        align === "center" && "text-center",
        numeric && "tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function DataTableEmptyRow({
  colSpan,
  children,
}: Readonly<{ colSpan: number; children: React.ReactNode }>) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}

export function DataTableSkeleton({
  rows = 8,
  columns = 4,
}: Readonly<{ rows?: number; columns?: number }>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-border">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
