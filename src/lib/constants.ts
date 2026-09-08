import type { TokenInfo } from "./types";
import {
  LayoutDashboard,
  Clock,
  Radio,
  ArrowLeftRight,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "AvenirFlow";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vesting", href: "/vesting", icon: Clock },
  { label: "Streams", href: "/streams", icon: Radio },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

/**
 * Token registry for the token picker in the create forms. Soroban tokens
 * are identified purely by contract id (C...), so there is no on-chain
 * "symbol" to discover generically — configure the tokens this deployment
 * supports here, or let a user paste a custom contract id.
 *
 * Override via NEXT_PUBLIC_TOKENS (JSON array of TokenInfo) for a different
 * network/deployment without a code change.
 */
function loadConfiguredTokens(): TokenInfo[] {
  const raw = process.env.NEXT_PUBLIC_TOKENS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TokenInfo[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fall through to defaults
    }
  }
  return [
    {
      contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      code: "XLM",
      name: "Stellar Lumens",
      decimals: 7,
    },
    {
      contractId: "CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU",
      code: "USDC",
      name: "USD Coin (testnet)",
      decimals: 7,
    },
  ];
}

export const CONFIGURED_TOKENS: TokenInfo[] = loadConfiguredTokens();

export function findToken(contractId: string): TokenInfo | undefined {
  return CONFIGURED_TOKENS.find((t) => t.contractId === contractId);
}

/** Fallback used when a schedule/stream references a token not in the registry. */
export function tokenOrFallback(contractId: string): TokenInfo {
  return (
    findToken(contractId) ?? {
      contractId,
      code: `${contractId.slice(0, 4)}…${contractId.slice(-4)}`,
      name: "Unknown token",
      decimals: 7,
    }
  );
}
