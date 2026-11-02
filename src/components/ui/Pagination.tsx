"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  disabled,
  className,
}: Readonly<PaginationProps>) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-muted">
            Rows per page
          </label>
          <select
            id="page-size"
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1 text-sm tabular-nums text-muted">
        <span>
          {start}-{end}
        </span>
        <span>of</span>
        <span>{totalItems.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-1">
        <PageButton onClick={() => onPageChange(1)} disabled={disabled || !canPrev} aria-label="First page">
          <ChevronsLeft size={16} />
        </PageButton>
        <PageButton onClick={() => onPageChange(page - 1)} disabled={disabled || !canPrev} aria-label="Previous page">
          <ChevronLeft size={16} />
        </PageButton>

        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers(page, pageCount).map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="px-2 text-muted">
                …
              </span>
            ) : (
              <PageButton
                key={p}
                onClick={() => onPageChange(p)}
                active={p === page}
                disabled={disabled}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </PageButton>
            ),
          )}
        </div>

        <span className="px-2 text-sm tabular-nums text-muted sm:hidden">
          {page} / {pageCount}
        </span>

        <PageButton onClick={() => onPageChange(page + 1)} disabled={disabled || !canNext} aria-label="Next page">
          <ChevronRight size={16} />
        </PageButton>
        <PageButton onClick={() => onPageChange(pageCount)} disabled={disabled || !canNext} aria-label="Last page">
          <ChevronsRight size={16} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  active,
  className,
  ...props
}: Readonly<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-primary text-white" : "text-muted hover:bg-bg hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
  if (current < total - 2) pages.push("...");
  if (!pages.includes(total)) pages.push(total);
  return pages;
}
