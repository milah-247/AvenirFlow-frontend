"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, id, label, description, disabled }: SwitchProps) {
  return (
    <label htmlFor={id} className={cn("flex items-start gap-3", disabled ? "opacity-50" : "cursor-pointer")}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-muted border border-border",
        )}
      >
        <span
          className={cn(
            "block size-4.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5.5" : "translate-x-1",
          )}
          style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
        />
      </button>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </span>
      )}
    </label>
  );
}
