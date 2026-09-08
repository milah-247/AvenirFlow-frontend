"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { STELLAR_EXPLORER_ACCOUNT_URL } from "@/lib/stellar/config";
import { cn } from "@/lib/utils";

interface AddressPillProps {
  address: string;
  className?: string;
  explorerLink?: boolean;
}

export function AddressPill({ address, className, explorerLink = true }: AddressPillProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs", className)}>
      <span title={address}>{truncateAddress(address)}</span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy address"
        className="text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      {explorerLink && (
        <a
          href={STELLAR_EXPLORER_ACCOUNT_URL(address)}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View on Stellar Expert"
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </span>
  );
}
