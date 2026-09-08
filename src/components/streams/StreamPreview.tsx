import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDateTime, formatDuration, parseTokenAmount } from "@/lib/utils";
import type { TokenInfo } from "@/lib/types";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { CalendarClock, Gauge, Timer } from "lucide-react";

interface StreamPreviewProps {
  token: TokenInfo | null;
  recipient: string;
  ratePerSecond: string;
  startDateTime: string;
  endDateTime: string;
}

export function StreamPreview({ token, recipient, ratePerSecond, startDateTime, endDateTime }: StreamPreviewProps) {
  const start = startDateTime ? new Date(startDateTime) : null;
  const end = endDateTime ? new Date(endDateTime) : null;
  const durationSeconds = start && end ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000)) : 0;
  const rateBaseUnits = token ? parseTokenAmount(ratePerSecond || "0", token.decimals) : null;
  const totalBaseUnits = rateBaseUnits !== null ? rateBaseUnits * BigInt(durationSeconds) : null;

  const rows = [
    { icon: CalendarClock, label: "Starts", value: start ? formatDateTime(start) : "—" },
    { icon: CalendarClock, label: "Ends", value: end ? formatDateTime(end) : "—" },
    { icon: Timer, label: "Duration", value: durationSeconds > 0 ? formatDuration(durationSeconds) : "—" },
  ];

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Stream preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground">Total payment</p>
          {token && totalBaseUnits !== null ? (
            <TokenAmount amount={totalBaseUnits} token={token} size="lg" />
          ) : (
            <p className="text-2xl font-semibold text-muted-foreground">—</p>
          )}
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{recipient || "No recipient set"}</p>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm">
          <Gauge className="size-4 shrink-0 text-muted-foreground" />
          {token && rateBaseUnits !== null ? (
            <span>
              <TokenAmount amount={rateBaseUnits} token={token} size="sm" /> <span className="text-muted-foreground">/ second</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Set a rate to preview</span>
          )}
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
      </CardContent>
    </Card>
  );
}
