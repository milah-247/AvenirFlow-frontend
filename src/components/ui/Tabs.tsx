"use client";

import { cn } from "@/lib/utils";

export interface TabOption {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  active ? "bg-primary-soft text-primary" : "bg-border/60 text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
