"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Built on the native <dialog> element so Escape-to-close, backdrop
 * click-through prevention, and focus containment come from the browser
 * for free, with no extra dependency.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "m-auto w-full max-w-md rounded-card border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50",
        "open:animate-[fadeIn_0.15s_ease-out]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="icon" aria-label="Close dialog" onClick={() => onOpenChange(false)}>
          <X className="size-4" />
        </Button>
      </div>
      {children && <div className="px-5 pb-5">{children}</div>}
      {footer && <div className="flex justify-end gap-2 border-t border-border p-5">{footer}</div>}
    </dialog>
  );
}
