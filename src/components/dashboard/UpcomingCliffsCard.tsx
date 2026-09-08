"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonText } from "@/components/ui/Skeleton";
import { AddressPill } from "@/components/shared/AddressPill";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { useDashboardStats } from "@/hooks/useDashboard";
import { cliffEndUnix } from "@/lib/stellar/schedules";
import { formatDuration, nowSeconds } from "@/lib/utils";
import { tokenOrFallback } from "@/lib/constants";

const WINDOW_SECONDS = 30 * 24 * 3600;

export function UpcomingCliffsCard() {
  const { schedules, isLoading } = useDashboardStats();
  const now = nowSeconds();

  const upcoming = schedules
    .filter((s) => s.status === "active" || s.status === "pending")
    .map((s) => ({ schedule: s, cliffEnd: cliffEndUnix(s) }))
    .filter(({ cliffEnd }) => cliffEnd > now && cliffEnd - now <= WINDOW_SECONDS)
    .sort((a, b) => a.cliffEnd - b.cliffEnd)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming cliffs</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="px-5 pb-5">
            <SkeletonText lines={3} />
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState icon={Timer} title="No cliffs unlocking soon" description="Nothing vesting into within the next 30 days." />
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map(({ schedule, cliffEnd }) => {
              const token = tokenOrFallback(schedule.token_address);
              return (
                <li key={schedule.id} className="px-5 py-3">
                  <Link href={`/vesting/${schedule.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        <AddressPill address={schedule.beneficiary} explorerLink={false} />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Unlocks in {formatDuration(cliffEnd - now)}
                      </p>
                    </div>
                    <TokenAmount amount={schedule.total_amount} token={token} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
