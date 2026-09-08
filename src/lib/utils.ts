import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Shortens a Stellar G.../C... address to `GABC…WXYZ`. */
export function truncateAddress(address: string, lead = 4, trail = 4): string {
  if (!address || address.length <= lead + trail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-trail)}`;
}

/**
 * Formats an integer base-unit amount (a decimal string, as returned by the
 * API) into a human-readable token amount using BigInt math throughout, so
 * large i128 balances never lose precision the way `Number()` would.
 */
export function formatTokenAmount(
  raw: string | bigint,
  decimals: number,
  opts: { maxFractionDigits?: number } = {},
): string {
  const value = typeof raw === "bigint" ? raw : BigInt(raw || "0");
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;

  let fracStr = frac.toString().padStart(decimals, "0");
  const maxFrac = opts.maxFractionDigits ?? Math.min(decimals, 4);
  fracStr = fracStr.slice(0, maxFrac).replace(/0+$/, "");

  const wholeStr = whole.toLocaleString("en-US");
  const sign = negative ? "-" : "";
  return fracStr.length > 0 ? `${sign}${wholeStr}.${fracStr}` : `${sign}${wholeStr}`;
}

/** Parses a user-typed decimal amount string into base units (BigInt), given token decimals. */
export function parseTokenAmount(input: string, decimals: number): bigint | null {
  const trimmed = input.trim();
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed) || trimmed === ".") return null;
  const [wholePart = "0", fracPart = ""] = trimmed.split(".");
  if (fracPart.length > decimals) return null;
  const paddedFrac = fracPart.padEnd(decimals, "0");
  try {
    return BigInt(wholePart || "0") * 10n ** BigInt(decimals) + BigInt(paddedFrac || "0");
  } catch {
    return null;
  }
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Formats a seconds duration as e.g. "3d 4h", "45m", "12s". */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0s";
  const units: [string, number][] = [
    ["y", 365 * 24 * 3600],
    ["d", 24 * 3600],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ];
  let remaining = Math.floor(totalSeconds);
  const parts: string[] = [];
  for (const [label, size] of units) {
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      remaining -= count * size;
      parts.push(`${count}${label}`);
      if (parts.length === 2) break;
    }
  }
  return parts.length > 0 ? parts.join(" ") : "0s";
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
