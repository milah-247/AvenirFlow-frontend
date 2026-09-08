"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CalendarClock, HandCoins, Lock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Dialog } from "@/components/ui/Dialog";
import { SkeletonText } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { VestingStatusBadge } from "@/components/shared/StatusBadge";
import { AddressPill } from "@/components/shared/AddressPill";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { useVestingSchedule, useClaimVesting, useCancelVesting, useVestingClaims } from "@/hooks/useVesting";
import { useWallet } from "@/hooks/useWallet";
import { useTicker } from "@/hooks/useTicker";
import { claimableAmount, cliffEndUnix, vestedAmount, vestingEndUnix, vestingProgressPct } from "@/lib/stellar/schedules";
import { formatDateTime, formatTokenAmount } from "@/lib/utils";
import { tokenOrFallback } from "@/lib/constants";

export function VestingDetail({ id }: { id: string }) {
  const { data: schedule, isLoading, isError, refetch } = useVestingSchedule(id, { refresh: true, pollMs: 20_000 });
  const { data: claims } = useVestingClaims(id);
  const { address } = useWallet();
  const claimMutation = useClaimVesting(id);
  const cancelMutation = useCancelVesting(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const now = useTicker(1000);

  if (isLoading) {
    return (
      <Card className="p-6">
        <SkeletonText lines={8} />
      </Card>
    );
  }

  if (isError || !schedule) {
    return (
      <Card>
        <ErrorState onRetry={() => refetch()} title="Couldn't load this vesting schedule" />
      </Card>
    );
  }

  const token = tokenOrFallback(schedule.token_address);
  const vested = vestedAmount(schedule, now);
  const claimable = claimableAmount(schedule, now);
  const remaining = BigInt(schedule.total_amount) - BigInt(schedule.claimed_amount);
  const progress = vestingProgressPct(schedule, now);

  const isBeneficiary = address === schedule.beneficiary;
  const isSender = address === schedule.sender;
  const canClaim = isBeneficiary && schedule.status === "active" && claimable > 0n;
  const canCancel = isSender && schedule.revocable && schedule.status === "active";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Vesting schedule</CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{schedule.id}</p>
          </div>
          <VestingStatusBadge status={schedule.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total allocation", value: schedule.total_amount, tone: "text-foreground" },
              { label: "Vested", value: vested.toString(), tone: "text-info" },
              { label: "Claimed", value: schedule.claimed_amount, tone: "text-success" },
              { label: "Remaining", value: remaining.toString(), tone: "text-foreground" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-lg font-semibold tabular-nums ${stat.tone}`}>
                  {formatTokenAmount(stat.value, token.decimals)}
                </p>
              </div>
            ))}
          </div>

          <ProgressBar value={progress} label="Vesting progress" />

          <dl className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <DetailRow label="Recipient">
              <AddressPill address={schedule.beneficiary} />
            </DetailRow>
            <DetailRow label="Creator">
              <AddressPill address={schedule.sender} />
            </DetailRow>
            <DetailRow label="Token">
              <span className="font-medium">{token.code}</span>{" "}
              <AddressPill address={schedule.token_address} explorerLink={false} />
            </DetailRow>
            <DetailRow label="Cancellable">{schedule.revocable ? "Yes" : "No"}</DetailRow>
            <DetailRow icon={CalendarClock} label="Start">
              {formatDateTime(schedule.start_time)}
            </DetailRow>
            <DetailRow icon={Lock} label="Cliff ends">
              {formatDateTime(new Date(cliffEndUnix(schedule) * 1000))}
            </DetailRow>
            <DetailRow icon={TrendingUp} label="Fully vests">
              {formatDateTime(new Date(vestingEndUnix(schedule) * 1000))}
            </DetailRow>
            <DetailRow label="Created by tx">
              <span className="font-mono text-xs text-muted-foreground">{schedule.created_tx_id ?? "—"}</span>
            </DetailRow>
          </dl>

          {schedule.status === "cancelled" && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                This schedule was cancelled{schedule.cancelled_at ? ` on ${formatDateTime(schedule.cancelled_at)}` : ""}. No
                further tokens will vest.
              </span>
            </div>
          )}
        </CardContent>

        {(canClaim || canCancel) && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border p-5">
            {canClaim && (
              <Button onClick={() => claimMutation.mutate()} loading={claimMutation.isPending}>
                <HandCoins className="size-4" />
                Claim {formatTokenAmount(claimable, token.decimals)} {token.code}
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                <Ban className="size-4" />
                Cancel schedule
              </Button>
            )}
          </div>
        )}
      </Card>

      {claims && claims.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Claim history</CardTitle>
          </CardHeader>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Transaction</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.items.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <TokenAmount amount={c.amount} token={token} size="sm" />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.tx_id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this vesting schedule?"
        description="Any amount that hasn't vested yet will stop vesting immediately. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep schedule
            </Button>
            <Button
              variant="destructive"
              loading={cancelMutation.isPending}
              onClick={() => {
                cancelMutation.mutate(undefined, { onSuccess: () => setCancelOpen(false) });
              }}
            >
              Yes, cancel it
            </Button>
          </>
        }
      />
    </div>
  );
}

function DetailRow({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: typeof CalendarClock;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}
