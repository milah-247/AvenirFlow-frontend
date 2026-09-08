"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDownToLine, CalendarClock, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Dialog } from "@/components/ui/Dialog";
import { SkeletonText } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { StreamStatusBadge } from "@/components/shared/StatusBadge";
import { AddressPill } from "@/components/shared/AddressPill";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { useStream, useStreamWithdrawals, useWithdrawFromStream } from "@/hooks/useStreams";
import { useWallet } from "@/hooks/useWallet";
import { useTicker } from "@/hooks/useTicker";
import { deriveRatePerSecond, streamedAmount, streamProgressPct, withdrawableAmount } from "@/lib/stellar/schedules";
import { formatDateTime, formatTokenAmount, parseTokenAmount } from "@/lib/utils";
import { tokenOrFallback } from "@/lib/constants";

export function StreamDetail({ id }: { id: string }) {
  const { data: stream, isLoading, isError, refetch } = useStream(id, { refresh: true, pollMs: 20_000 });
  const { data: withdrawals } = useStreamWithdrawals(id);
  const { address } = useWallet();
  const withdrawMutation = useWithdrawFromStream(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const now = useTicker(1000);

  if (isLoading) {
    return (
      <Card className="p-6">
        <SkeletonText lines={8} />
      </Card>
    );
  }

  if (isError || !stream) {
    return (
      <Card>
        <ErrorState onRetry={() => refetch()} title="Couldn't load this stream" />
      </Card>
    );
  }

  const token = tokenOrFallback(stream.token_address);
  const rate = deriveRatePerSecond(stream);
  const streamed = streamedAmount(stream, now, rate);
  const withdrawable = withdrawableAmount(stream, now, rate);
  const remainingInStream = BigInt(stream.deposit_amount) - BigInt(stream.withdrawn_amount);
  const progress = streamProgressPct(stream, now, rate);
  const isRecipient = address === stream.recipient;
  const canWithdraw = isRecipient && stream.status === "active" && withdrawable > 0n;

  const openWithdrawDialog = () => {
    setAmountInput(formatTokenAmount(withdrawable, token.decimals, { maxFractionDigits: token.decimals }));
    setDialogOpen(true);
  };

  const submitWithdraw = () => {
    const parsed = parseTokenAmount(amountInput, token.decimals);
    if (parsed === null || parsed <= 0n || parsed > withdrawable) return;
    withdrawMutation.mutate(parsed.toString(), { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Payment stream</CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{stream.id}</p>
          </div>
          <StreamStatusBadge status={stream.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Deposit", value: stream.deposit_amount, tone: "text-foreground" },
              { label: "Accrued", value: streamed.toString(), tone: "text-info" },
              { label: "Withdrawn", value: stream.withdrawn_amount, tone: "text-success" },
              { label: "Remaining", value: remainingInStream.toString(), tone: "text-foreground" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-lg font-semibold tabular-nums ${stat.tone}`}>
                  {formatTokenAmount(stat.value, token.decimals)}
                </p>
              </div>
            ))}
          </div>

          <ProgressBar value={progress} label="Stream progress" />

          <dl className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <DetailRow label="Recipient">
              <AddressPill address={stream.recipient} />
            </DetailRow>
            <DetailRow label="Sender">
              <AddressPill address={stream.sender} />
            </DetailRow>
            <DetailRow label="Token">
              <span className="font-medium">{token.code}</span>{" "}
              <AddressPill address={stream.token_address} explorerLink={false} />
            </DetailRow>
            <DetailRow icon={Gauge} label="Rate">
              {formatTokenAmount(rate, token.decimals, { maxFractionDigits: token.decimals })} {token.code} / second
            </DetailRow>
            <DetailRow icon={CalendarClock} label="Start time">
              {formatDateTime(stream.start_time)}
            </DetailRow>
            <DetailRow icon={CalendarClock} label="End time">
              {formatDateTime(stream.stop_time)}
            </DetailRow>
          </dl>

          {stream.status === "cancelled" && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>This stream was cancelled. No further payment accrues.</span>
            </div>
          )}
        </CardContent>

        {canWithdraw && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border p-5">
            <Button onClick={openWithdrawDialog}>
              <ArrowDownToLine className="size-4" />
              Withdraw {formatTokenAmount(withdrawable, token.decimals)} {token.code}
            </Button>
          </div>
        )}
      </Card>

      {withdrawals && withdrawals.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal history</CardTitle>
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
                {withdrawals.items.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <TokenAmount amount={w.amount} token={token} size="sm" />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{w.tx_id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(w.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Withdraw from stream"
        description={`Up to ${formatTokenAmount(withdrawable, token.decimals)} ${token.code} is currently available.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button loading={withdrawMutation.isPending} onClick={submitWithdraw}>
              Withdraw
            </Button>
          </>
        }
      >
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            aria-label="Withdrawal amount"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAmountInput(formatTokenAmount(withdrawable, token.decimals, { maxFractionDigits: token.decimals }))}
          >
            Max
          </Button>
        </div>
      </Dialog>
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
