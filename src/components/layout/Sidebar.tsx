"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves } from "lucide-react";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Waves className="size-4.5" aria-hidden="true" />
      </div>
      <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <SidebarBrand />
      <SidebarNav />
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        Stellar token vesting &amp; streaming for DAOs and grant programs.
      </div>
    </aside>
  );
}
