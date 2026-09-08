"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionStatusBadge } from "@/components/shared/StatusBadge";
import { AddressPill } from "@/components/shared/AddressPill";
import { TxHashLink } from "@/components/shared/TxHashLink";
import { formatDateTime } from "@/lib/utils";
import type { TransactionKind, TransactionRow } from "@/lib/types";

const KIND_LABELS: Record<TransactionKind, string> = {
  create_vesting: "Create vesting schedule",
  claim_vesting: "Claim vested tokens",
  cancel_vesting: "Cancel vesting schedule",
  create_stream: "Create stream",
  withdraw_stream: "Withdraw from stream",
};

function relatedHref(tx: TransactionRow): string | null {
  if (!tx.related_entity_id) return null;
  if (tx.related_entity_type === "vesting_schedule") return `/vesting/${tx.related_entity_id}`;
  if (tx.related_entity_type === "stream") return `/streams/${tx.related_entity_id}`;
  return null;
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  isLoading?: boolean;
  emptyDescription?: string;
}

export function TransactionsTable({ transactions, isLoading, emptyDescription }: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="No transactions yet"
        description={emptyDescription ?? "Transactions you sign will show up here once submitted."}
      />
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Account</th>
            <th className="px-5 py-3 font-medium">Tx hash</th>
            <th className="px-5 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const href = relatedHref(tx);
            const typeLabel = KIND_LABELS[tx.kind];
            return (
              <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                <td className="px-5 py-3 font-medium text-foreground">
                  {href ? (
                    <Link href={href} className="hover:underline">
                      {typeLabel}
                    </Link>
                  ) : (
                    typeLabel
                  )}
                </td>
                <td className="px-5 py-3">
                  <TransactionStatusBadge status={tx.status} />
                </td>
                <td className="px-5 py-3">
                  <AddressPill address={tx.source_account} explorerLink={false} />
                </td>
                <td className="px-5 py-3">
                  <TxHashLink hash={tx.hash} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(tx.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
