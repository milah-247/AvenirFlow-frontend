import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, invalid, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-danger focus:ring-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
});
Select.displayName = "Select";
