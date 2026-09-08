"use client";

import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { SidebarBrand, SidebarNav } from "./Sidebar";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </Button>

      <WalletButton />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between pr-2">
              <SidebarBrand />
              <Button variant="ghost" size="icon" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
