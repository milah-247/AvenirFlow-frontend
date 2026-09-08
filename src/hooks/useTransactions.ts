"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getTransaction } from "@/lib/api/transactions";
import { useWallet } from "./useWallet";
import { useVestingSchedulesAsBeneficiary, useVestingSchedulesAsSender } from "./useVesting";
import { useStreamsAsRecipient, useStreamsAsSender } from "./useStreams";
import type { TransactionRow } from "@/lib/types";

interface TxRef {
  id: string;
  /** created_at of the owning row, used only to pick the most-recent N before fetching. */
  referenceDate: string;
}

/**
 * The backend has no `GET /transactions?wallet=` list endpoint yet — each
 * vesting schedule / stream only remembers the individual transaction ids
 * that touched it (`created_tx_id`, `cancelled_tx_id`). This collects the
 * unique ids referenced by everything the connected wallet is party to,
 * keeps the most recent ones, and fetches each transaction's full status.
 *
 * Replace this with a single paginated endpoint once the backend exposes
 * one — the aggregation logic is isolated here so that's a one-hook change.
 */
export function useRecentTransactions(limit = 20) {
  const { authToken } = useWallet();
  const beneficiarySchedules = useVestingSchedulesAsBeneficiary();
  const senderSchedules = useVestingSchedulesAsSender();
  const recipientStreams = useStreamsAsRecipient();
  const senderStreams = useStreamsAsSender();

  const isLoadingSources =
    beneficiarySchedules.isLoading || senderSchedules.isLoading || recipientStreams.isLoading || senderStreams.isLoading;

  const refs = useMemo<TxRef[]>(() => {
    const seen = new Map<string, TxRef>();
    const add = (id: string | null, referenceDate: string) => {
      if (!id) return;
      const existing = seen.get(id);
      if (!existing || existing.referenceDate < referenceDate) seen.set(id, { id, referenceDate });
    };

    for (const s of beneficiarySchedules.data?.items ?? []) {
      add(s.created_tx_id, s.created_at);
      add(s.cancelled_tx_id, s.cancelled_at ?? s.updated_at);
    }
    for (const s of senderSchedules.data?.items ?? []) {
      add(s.created_tx_id, s.created_at);
      add(s.cancelled_tx_id, s.cancelled_at ?? s.updated_at);
    }
    for (const s of recipientStreams.data?.items ?? []) {
      add(s.created_tx_id, s.created_at);
      add(s.cancelled_tx_id, s.cancelled_at ?? s.updated_at);
    }
    for (const s of senderStreams.data?.items ?? []) {
      add(s.created_tx_id, s.created_at);
      add(s.cancelled_tx_id, s.cancelled_at ?? s.updated_at);
    }

    return Array.from(seen.values())
      .sort((a, b) => (a.referenceDate < b.referenceDate ? 1 : -1))
      .slice(0, limit);
  }, [
    beneficiarySchedules.data,
    senderSchedules.data,
    recipientStreams.data,
    senderStreams.data,
    limit,
  ]);

  const txQueries = useQueries({
    queries: refs.map((ref) => ({
      queryKey: ["transactions", "detail", ref.id],
      queryFn: () => getTransaction(ref.id, authToken!),
      enabled: !!authToken,
      staleTime: 15_000,
    })),
  });

  const transactions = useMemo<TransactionRow[]>(() => {
    return txQueries
      .map((q) => q.data)
      .filter((tx): tx is TransactionRow => !!tx)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [txQueries]);

  return {
    transactions,
    isLoading: isLoadingSources || (refs.length > 0 && txQueries.some((q) => q.isLoading)),
    isEmpty: !isLoadingSources && refs.length === 0,
  };
}

export function useTransaction(id: string) {
  const { authToken } = useWallet();
  return useQuery({
    queryKey: ["transactions", "detail", id],
    queryFn: () => getTransaction(id, authToken!),
    enabled: !!id && !!authToken,
  });
}
