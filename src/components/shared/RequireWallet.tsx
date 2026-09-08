"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

/** Gates a page behind an active wallet connection with a friendly prompt. */
export function RequireWallet({ children }: { children: React.ReactNode }) {
  const { isConnected, connect } = useWallet();
  const [connecting, setConnecting] = useState(false);

  if (isConnected) return <>{children}</>;

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      // toast already shown
    } finally {
      setConnecting(false);
    }
  };

  return (
    <EmptyState
      icon={Wallet}
      title="Connect your Stellar wallet"
      description="Connect Freighter to view your vesting schedules, payment streams, and transaction history."
      action={
        <Button onClick={handleConnect} loading={connecting}>
          Connect wallet
        </Button>
      }
      className="mt-10 rounded-card border border-dashed border-border"
    />
  );
}
