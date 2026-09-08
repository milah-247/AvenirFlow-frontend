"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/lib/utils";
import { isWrongNetwork } from "@/lib/stellar/wallet";
import { STELLAR_NETWORK } from "@/lib/stellar/config";
import { Badge } from "@/components/ui/Badge";

export function WalletButton() {
  const { status, address, networkPassphrase, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      // toast already shown by useWallet
    } finally {
      setConnecting(false);
    }
  };

  if (status !== "connected" || !address) {
    return (
      <Button onClick={handleConnect} loading={connecting} size="sm">
        <Wallet className="size-4" />
        Connect wallet
      </Button>
    );
  }

  const wrongNetwork = isWrongNetwork(networkPassphrase);

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
        <span className={`size-2 rounded-full ${wrongNetwork ? "bg-warning" : "bg-success"}`} aria-hidden="true" />
        <span className="font-mono">{truncateAddress(address)}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-border bg-surface p-1.5 shadow-lg"
        >
          <div className="px-2.5 py-2">
            <p className="text-xs text-muted-foreground">Connected account</p>
            <p className="mt-0.5 break-all font-mono text-xs text-foreground">{address}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <Badge tone={wrongNetwork ? "warning" : "success"} dot>
                {wrongNetwork ? "Wrong network" : STELLAR_NETWORK}
              </Badge>
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            onClick={() => {
              navigator.clipboard?.writeText(address).catch(() => {});
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground hover:bg-surface-hover"
          >
            <Copy className="size-4" /> Copy address
          </button>
          <button
            role="menuitem"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="size-4" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
