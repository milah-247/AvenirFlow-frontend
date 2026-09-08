import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger focus:ring-danger",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
