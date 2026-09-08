"use client";

import { useMemo } from "react";
import { useVestingSchedulesAsBeneficiary, useVestingSchedulesAsSender } from "./useVesting";
import { useStreamsAsRecipient, useStreamsAsSender } from "./useStreams";
import { cliffEndUnix } from "@/lib/stellar/schedules";
import { nowSeconds } from "@/lib/utils";
import type { DashboardStats, StreamRow, VestingScheduleRow } from "@/lib/types";

const UPCOMING_CLIFF_WINDOW_SECONDS = 30 * 24 * 3600; // 30 days

function dedupeById<T extends { id: string }>(...lists: (T[] | undefined)[]): T[] {
  const map = new Map<string, T>();
  for (const list of lists) for (const item of list ?? []) map.set(item.id, item);
  return Array.from(map.values());
}

/**
 * Combines every vesting schedule and stream the connected wallet is party
 * to (as creator or as recipient) into the dashboard's headline numbers.
 * There's no dedicated `/dashboard/summary` endpoint on the backend yet, so
 * this aggregates client-side from the same list queries the Vesting and
 * Streams pages already use (react-query dedupes the underlying requests).
 */
export function useDashboardStats() {
  const beneficiary = useVestingSchedulesAsBeneficiary();
  const sender = useVestingSchedulesAsSender();
  const recipientStreams = useStreamsAsRecipient();
  const senderStreams = useStreamsAsSender();

  const isLoading = beneficiary.isLoading || sender.isLoading || recipientStreams.isLoading || senderStreams.isLoading;
  const isError = beneficiary.isError || sender.isError || recipientStreams.isError || senderStreams.isError;

  const schedules = useMemo(
    () => dedupeById<VestingScheduleRow>(beneficiary.data?.items, sender.data?.items),
    [beneficiary.data, sender.data],
  );
  const streams = useMemo(
    () => dedupeById<StreamRow>(recipientStreams.data?.items, senderStreams.data?.items),
    [recipientStreams.data, senderStreams.data],
  );

  const stats = useMemo<DashboardStats>(() => {
    const now = nowSeconds();
    let totalAllocated = 0n;
    let totalClaimed = 0n;
    let activeVestingCount = 0;
    let upcomingCliffsCount = 0;
    let completedSchedulesCount = 0;

    for (const s of schedules) {
      totalAllocated += BigInt(s.total_amount);
      totalClaimed += BigInt(s.claimed_amount);
      if (s.status === "active" || s.status === "pending") {
        if (s.status === "active") activeVestingCount++;
        const cliffEnd = cliffEndUnix(s);
        if (cliffEnd > now && cliffEnd - now <= UPCOMING_CLIFF_WINDOW_SECONDS) upcomingCliffsCount++;
      }
      if (s.status === "completed") completedSchedulesCount++;
    }

    const activeStreamCount = streams.filter((s) => s.status === "active").length;

    return {
      totalAllocated,
      totalClaimed,
      activeVestingCount,
      activeStreamCount,
      upcomingCliffsCount,
      completedSchedulesCount,
    };
  }, [schedules, streams]);

  return { stats, schedules, streams, isLoading, isError };
}
