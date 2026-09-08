"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddressPill } from "@/components/shared/AddressPill";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/providers/ThemeProvider";
import { API_BASE_URL } from "@/lib/api/client";
import { AVENIRFLOW_CONTRACT_ID, HORIZON_URL, NETWORK_PASSPHRASE, SOROBAN_RPC_URL, STELLAR_NETWORK } from "@/lib/stellar/config";
import { CONFIGURED_TOKENS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { address, networkPassphrase, status, disconnect, user } = useWallet();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Wallet connection, network configuration, and appearance." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how AvenirFlow looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex rounded-lg border border-border p-1">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    theme === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <opt.icon className="size-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your connected Stellar account and session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "connected" && address ? (
              <>
                <SettingsRow label="Address">
                  <AddressPill address={address} />
                </SettingsRow>
                <SettingsRow label="Wallet network">
                  <span className="font-mono text-xs">{networkPassphrase ?? "—"}</span>
                </SettingsRow>
                <SettingsRow label="Session">
                  <span>{user ? "Signed in" : "Not signed in"}</span>
                </SettingsRow>
                <Button variant="destructive" size="sm" onClick={disconnect}>
                  Disconnect wallet
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No wallet connected. Use the button in the top bar to connect Freighter.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network</CardTitle>
            <CardDescription>This deployment&rsquo;s Stellar network and contract configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsRow label="Network">{STELLAR_NETWORK}</SettingsRow>
            <SettingsRow label="Network passphrase">
              <span className="font-mono text-xs">{NETWORK_PASSPHRASE}</span>
            </SettingsRow>
            <SettingsRow label="Horizon URL">
              <span className="font-mono text-xs break-all">{HORIZON_URL}</span>
            </SettingsRow>
            <SettingsRow label="Soroban RPC URL">
              <span className="font-mono text-xs break-all">{SOROBAN_RPC_URL}</span>
            </SettingsRow>
            <SettingsRow label="AvenirFlow contract">
              <span className="font-mono text-xs break-all">{AVENIRFLOW_CONTRACT_ID || "Not configured"}</span>
            </SettingsRow>
            <SettingsRow label="AvenirFlow API">
              <span className="font-mono text-xs break-all">{API_BASE_URL}</span>
            </SettingsRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configured tokens</CardTitle>
            <CardDescription>Tokens available in the vesting and stream creation forms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CONFIGURED_TOKENS.map((t) => (
              <div key={t.contractId} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.code} <span className="font-normal text-muted-foreground">— {t.name}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{t.contractId}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{t.decimals} decimals</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}
