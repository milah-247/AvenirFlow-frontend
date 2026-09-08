import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  loading?: boolean;
  tone?: "primary" | "success" | "warning" | "info" | "neutral";
  hint?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({ label, value, icon: Icon, loading, tone = "neutral", hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1 truncate text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
