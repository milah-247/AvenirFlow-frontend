"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VestingStatusBadge } from "@/components/shared/StatusBadge";
import { AddressPill } from "@/components/shared/AddressPill";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { useTicker } from "@/hooks/useTicker";
import { vestingProgressPct } from "@/lib/stellar/schedules";
import { formatDate } from "@/lib/utils";
import { tokenOrFallback } from "@/lib/constants";
import type { VestingScheduleRow } from "@/lib/types";

interface VestingTableProps {
  schedules: VestingScheduleRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  role: "beneficiary" | "sender";
}

export function VestingTable({ schedules, isLoading, isError, onRetry, role }: VestingTableProps) {
  const now = useTicker(30_000);

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        <SkeletonText lines={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={onRetry} />;

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={role === "beneficiary" ? "No vesting schedules yet" : "You haven't created any vesting schedules"}
        description={
          role === "beneficiary"
            ? "Vesting schedules where you're the recipient will appear here."
            : "Create a vesting schedule to lock tokens for a recipient."
        }
      />
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">{role === "beneficiary" ? "Creator" : "Recipient"}</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Progress</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Start</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const token = tokenOrFallback(s.token_address);
            const counterparty = role === "beneficiary" ? s.sender : s.beneficiary;
            const pct = vestingProgressPct(s, now);
            return (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                <td className="px-5 py-3">
                  <Link href={`/vesting/${s.id}`} className="block">
                    <AddressPill address={counterparty} explorerLink={false} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/vesting/${s.id}`}>
                    <TokenAmount amount={s.total_amount} token={token} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/vesting/${s.id}`} className="block w-32">
                    <ProgressBar value={pct} tone={s.status === "cancelled" ? "warning" : "primary"} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/vesting/${s.id}`}>
                    <VestingStatusBadge status={s.status} />
                  </Link>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                  <Link href={`/vesting/${s.id}`}>{formatDate(s.start_time)}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
