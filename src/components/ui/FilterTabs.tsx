"use client";

import { cn } from "@/lib/utils";

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Underline-style filter tabs matching the BodaPlus "My Loans" header tabs.
 */
export function FilterTabs({ tabs, active, onChange, className }: Readonly<FilterTabsProps>) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-border", className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-primary-light text-primary" : "bg-bg text-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
