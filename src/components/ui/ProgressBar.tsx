import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  tone?: "primary" | "success" | "warning";
  label?: string;
}

export function ProgressBar({ value, className, tone = "primary", label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  }[tone];

  return (
    <div className={cn("space-y-1", className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", toneClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
