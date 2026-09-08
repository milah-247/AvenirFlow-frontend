"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StreamStatusBadge } from "@/components/shared/StatusBadge";
import { AddressPill } from "@/components/shared/AddressPill";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { useTicker } from "@/hooks/useTicker";
import { deriveRatePerSecond, streamProgressPct } from "@/lib/stellar/schedules";
import { formatDate } from "@/lib/utils";
import { tokenOrFallback } from "@/lib/constants";
import type { StreamRow } from "@/lib/types";

interface StreamTableProps {
  streams: StreamRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  role: "recipient" | "sender";
}

export function StreamTable({ streams, isLoading, isError, onRetry, role }: StreamTableProps) {
  const now = useTicker(1000);

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        <SkeletonText lines={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={onRetry} />;

  if (streams.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title={role === "recipient" ? "No streams yet" : "You haven't created any streams"}
        description={
          role === "recipient"
            ? "Payment streams where you're the recipient will appear here."
            : "Create a stream to pay a recipient continuously over time."
        }
      />
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">{role === "recipient" ? "Sender" : "Recipient"}</th>
            <th className="px-5 py-3 font-medium">Deposit</th>
            <th className="px-5 py-3 font-medium">Progress</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Start</th>
          </tr>
        </thead>
        <tbody>
          {streams.map((s) => {
            const token = tokenOrFallback(s.token_address);
            const counterparty = role === "recipient" ? s.sender : s.recipient;
            const rate = deriveRatePerSecond(s);
            const pct = streamProgressPct(s, now, rate);
            return (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                <td className="px-5 py-3">
                  <Link href={`/streams/${s.id}`} className="block">
                    <AddressPill address={counterparty} explorerLink={false} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/streams/${s.id}`}>
                    <TokenAmount amount={s.deposit_amount} token={token} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/streams/${s.id}`} className="block w-32">
                    <ProgressBar value={pct} tone={s.status === "cancelled" ? "warning" : "primary"} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/streams/${s.id}`}>
                    <StreamStatusBadge status={s.status} />
                  </Link>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                  <Link href={`/streams/${s.id}`}>{formatDate(s.start_time)}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
