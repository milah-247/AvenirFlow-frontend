import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDateTime, formatDuration, parseTokenAmount } from "@/lib/utils";
import { toSeconds, type DurationUnit } from "@/lib/validation/common";
import type { TokenInfo } from "@/lib/types";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { CalendarClock, Lock, TrendingUp } from "lucide-react";

interface VestingPreviewProps {
  token: TokenInfo | null;
  recipient: string;
  totalAmount: string;
  startDate: string;
  cliffValue: number;
  cliffUnit: DurationUnit;
  vestingValue: number;
  vestingUnit: DurationUnit;
  cancellable: boolean;
}

export function VestingPreview(props: VestingPreviewProps) {
  const { token, recipient, totalAmount, startDate, cliffValue, cliffUnit, vestingValue, vestingUnit, cancellable } = props;

  const start = startDate ? new Date(startDate) : null;
  const cliffSeconds = toSeconds(cliffValue || 0, cliffUnit);
  const vestingSeconds = toSeconds(vestingValue || 0, vestingUnit);
  const cliffEnd = start ? new Date(start.getTime() + cliffSeconds * 1000) : null;
  const vestingEnd = start ? new Date(start.getTime() + vestingSeconds * 1000) : null;
  const amountBaseUnits = token ? parseTokenAmount(totalAmount || "0", token.decimals) : null;

  const rows: { icon: typeof CalendarClock; label: string; value: string }[] = [
    { icon: CalendarClock, label: "Starts", value: start ? formatDateTime(start) : "—" },
    {
      icon: Lock,
      label: "Cliff ends",
      value: cliffEnd ? `${formatDateTime(cliffEnd)} (${formatDuration(cliffSeconds) || "immediately"})` : "—",
    },
    {
      icon: TrendingUp,
      label: "Fully vested",
      value: vestingEnd ? `${formatDateTime(vestingEnd)} (${formatDuration(vestingSeconds)})` : "—",
    },
  ];

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Schedule preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground">Recipient receives</p>
          {token && amountBaseUnits !== null ? (
            <TokenAmount amount={amountBaseUnits} token={token} size="lg" />
          ) : (
            <p className="text-2xl font-semibold text-muted-foreground">—</p>
          )}
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{recipient || "No recipient set"}</p>
        </div>

        {/* Illustrative curve: flat during the cliff, then linear to 100%. */}
        <div className="space-y-1.5">
          <svg viewBox="0 0 200 60" className="h-14 w-full text-primary" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={(() => {
                const total = vestingSeconds || 1;
                const cliffX = Math.min(200, (cliffSeconds / total) * 200);
                return `0,58 ${cliffX.toFixed(1)},58 200,2`;
              })()}
            />
          </svg>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Start</span>
            {cliffSeconds > 0 && <span>Cliff</span>}
            <span>100% vested</span>
          </div>
        </div>

        <dl className="space-y-2.5 border-t border-border pt-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-2.5 text-sm">
              <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="flex flex-1 justify-between gap-2">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium text-foreground">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {cancellable
            ? "This schedule can be cancelled by you before it completes; any unvested amount stops vesting immediately on cancellation."
            : "This schedule cannot be cancelled once created."}
        </p>
      </CardContent>
    </Card>
  );
}
