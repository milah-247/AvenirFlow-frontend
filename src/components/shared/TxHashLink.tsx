import { ExternalLink } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { STELLAR_EXPLORER_TX_URL } from "@/lib/stellar/config";

export function TxHashLink({ hash }: { hash: string | null }) {
  if (!hash) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={STELLAR_EXPLORER_TX_URL(hash)}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
    >
      {truncateAddress(hash)}
      <ExternalLink className="size-3" />
    </a>
  );
}
