"use client";

import { CheckCircle2, Clock, Coins, HandCoins, Radio, Timer } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardStats } from "@/hooks/useDashboard";
import { formatTokenAmount } from "@/lib/utils";
import { CONFIGURED_TOKENS } from "@/lib/constants";

/**
 * Amounts are aggregated across every configured token's base units, so the
 * headline figures are displayed using the first configured token's
 * decimals as a representative unit. In a multi-token deployment, replace
 * this with a per-token breakdown once the API exposes per-token totals.
 */
export function StatsGrid() {
  const { stats, isLoading } = useDashboardStats();
  const decimals = CONFIGURED_TOKENS[0]?.decimals ?? 7;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <StatCard
        label="Total allocated"
        value={formatTokenAmount(stats.totalAllocated, decimals)}
        icon={Coins}
        tone="primary"
        loading={isLoading}
        hint="Across all your vesting schedules"
      />
      <StatCard
        label="Total claimed"
        value={formatTokenAmount(stats.totalClaimed, decimals)}
        icon={HandCoins}
        tone="success"
        loading={isLoading}
      />
      <StatCard
        label="Active vesting schedules"
        value={String(stats.activeVestingCount)}
        icon={Clock}
        tone="info"
        loading={isLoading}
      />
      <StatCard
        label="Active streams"
        value={String(stats.activeStreamCount)}
        icon={Radio}
        tone="info"
        loading={isLoading}
      />
      <StatCard
        label="Upcoming cliffs"
        value={String(stats.upcomingCliffsCount)}
        icon={Timer}
        tone="warning"
        loading={isLoading}
        hint="Unlocking within 30 days"
      />
      <StatCard
        label="Completed schedules"
        value={String(stats.completedSchedulesCount)}
        icon={CheckCircle2}
        tone="neutral"
        loading={isLoading}
      />
    </div>
  );
}
