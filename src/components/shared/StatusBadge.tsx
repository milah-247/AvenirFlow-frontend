import { Badge } from "@/components/ui/Badge";
import type { StreamStatus, TransactionStatus, VestingStatus } from "@/lib/types";

const VESTING_TONE: Record<VestingStatus, "neutral" | "primary" | "success" | "danger"> = {
  pending: "neutral",
  active: "primary",
  completed: "success",
  cancelled: "danger",
};

const STREAM_TONE: Record<StreamStatus, "neutral" | "primary" | "success" | "danger"> = {
  pending: "neutral",
  active: "primary",
  completed: "success",
  cancelled: "danger",
};

const TX_TONE: Record<TransactionStatus, "neutral" | "primary" | "success" | "danger" | "warning"> = {
  building: "neutral",
  pending_signature: "warning",
  submitted: "primary",
  success: "success",
  failed: "danger",
  expired: "danger",
};

const LABELS: Record<string, string> = {
  pending_signature: "Awaiting signature",
};

function labelFor(status: string): string {
  return LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

export function VestingStatusBadge({ status }: { status: VestingStatus }) {
  return (
    <Badge tone={VESTING_TONE[status]} dot>
      {labelFor(status)}
    </Badge>
  );
}

export function StreamStatusBadge({ status }: { status: StreamStatus }) {
  return (
    <Badge tone={STREAM_TONE[status]} dot>
      {labelFor(status)}
    </Badge>
  );
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge tone={TX_TONE[status]} dot>
      {labelFor(status)}
    </Badge>
  );
}
