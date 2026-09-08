"use client";

import { useEffect, useState } from "react";
import { nowSeconds } from "@/lib/utils";

/**
 * Re-renders the calling component every `intervalMs`, returning the
 * current unix timestamp. Used to drive live-updating accrued/vested
 * balances without a network refetch on every tick.
 */
export function useTicker(intervalMs = 1000): number {
  const [now, setNow] = useState(nowSeconds);

  useEffect(() => {
    const id = setInterval(() => setNow(nowSeconds()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
