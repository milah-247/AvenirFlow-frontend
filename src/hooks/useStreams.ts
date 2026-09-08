"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStream,
  getStream,
  listStreamWithdrawals,
  listStreams,
  withdrawFromStream,
  type CreateStreamInput,
} from "@/lib/api/streams";
import { useWallet } from "./useWallet";
import { runTransactionFlow } from "./useTransactionFlow";

const KEY = {
  list: (address: string | null, role: "recipient" | "sender") => ["streams", "list", role, address] as const,
  detail: (id: string) => ["streams", "detail", id] as const,
  withdrawals: (id: string) => ["streams", "withdrawals", id] as const,
};

export function useStreamsAsRecipient(limit = 100) {
  const { address } = useWallet();
  return useQuery({
    queryKey: KEY.list(address, "recipient"),
    queryFn: () => listStreams({ recipient: address!, limit }),
    enabled: !!address,
  });
}

export function useStreamsAsSender(limit = 100) {
  const { address } = useWallet();
  return useQuery({
    queryKey: KEY.list(address, "sender"),
    queryFn: () => listStreams({ sender: address!, limit }),
    enabled: !!address,
  });
}

export function useStream(id: string, opts: { refresh?: boolean; pollMs?: number } = {}) {
  return useQuery({
    queryKey: KEY.detail(id),
    queryFn: () => getStream(id, { refresh: opts.refresh }),
    enabled: !!id,
    refetchInterval: opts.pollMs,
  });
}

export function useStreamWithdrawals(id: string) {
  return useQuery({
    queryKey: KEY.withdrawals(id),
    queryFn: () => listStreamWithdrawals(id),
    enabled: !!id,
  });
}

export function useCreateStream() {
  const { ensureAuthenticated, address } = useWallet();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStreamInput) => {
      const token = await ensureAuthenticated();
      const { stream, transaction } = await createStream(input, token);
      const finalTx = await runTransactionFlow(transaction, token, {
        pending: "Creating stream",
        success: "Stream created",
        failure: "Failed to create stream",
      });
      return { stream, transaction: finalTx };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY.list(address, "sender") });
      qc.invalidateQueries({ queryKey: KEY.list(address, "recipient") });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useWithdrawFromStream(id: string) {
  const { ensureAuthenticated, address } = useWallet();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const token = await ensureAuthenticated();
      const { transaction } = await withdrawFromStream(id, amount, token);
      return runTransactionFlow(transaction, token, {
        pending: "Withdrawing from stream",
        success: "Withdrawal complete",
        failure: "Failed to withdraw",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY.detail(id) });
      qc.invalidateQueries({ queryKey: KEY.withdrawals(id) });
      qc.invalidateQueries({ queryKey: KEY.list(address, "recipient") });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
