"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelVesting,
  claimVesting,
  createVestingSchedule,
  getVestingSchedule,
  listVestingClaims,
  listVestingSchedules,
  type CreateVestingInput,
} from "@/lib/api/vesting";
import { useWallet } from "./useWallet";
import { runTransactionFlow } from "./useTransactionFlow";

const KEY = {
  list: (address: string | null, role: "beneficiary" | "sender") => ["vesting", "list", role, address] as const,
  detail: (id: string) => ["vesting", "detail", id] as const,
  claims: (id: string) => ["vesting", "claims", id] as const,
};

export function useVestingSchedulesAsBeneficiary(limit = 100) {
  const { address } = useWallet();
  return useQuery({
    queryKey: KEY.list(address, "beneficiary"),
    queryFn: () => listVestingSchedules({ beneficiary: address!, limit }),
    enabled: !!address,
  });
}

export function useVestingSchedulesAsSender(limit = 100) {
  const { address } = useWallet();
  return useQuery({
    queryKey: KEY.list(address, "sender"),
    queryFn: () => listVestingSchedules({ sender: address!, limit }),
    enabled: !!address,
  });
}

export function useVestingSchedule(id: string, opts: { refresh?: boolean; pollMs?: number } = {}) {
  return useQuery({
    queryKey: KEY.detail(id),
    queryFn: () => getVestingSchedule(id, { refresh: opts.refresh }),
    enabled: !!id,
    refetchInterval: opts.pollMs,
  });
}

export function useVestingClaims(id: string) {
  return useQuery({
    queryKey: KEY.claims(id),
    queryFn: () => listVestingClaims(id),
    enabled: !!id,
  });
}

export function useCreateVestingSchedule() {
  const { ensureAuthenticated, address } = useWallet();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVestingInput) => {
      const token = await ensureAuthenticated();
      const { vestingSchedule, transaction } = await createVestingSchedule(input, token);
      const finalTx = await runTransactionFlow(transaction, token, {
        pending: "Creating vesting schedule",
        success: "Vesting schedule created",
        failure: "Failed to create vesting schedule",
      });
      return { vestingSchedule, transaction: finalTx };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vesting", "list", "sender", address] });
      qc.invalidateQueries({ queryKey: ["vesting", "list", "beneficiary", address] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useClaimVesting(id: string) {
  const { ensureAuthenticated, address } = useWallet();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await ensureAuthenticated();
      const { transaction } = await claimVesting(id, token);
      return runTransactionFlow(transaction, token, {
        pending: "Claiming vested tokens",
        success: "Tokens claimed",
        failure: "Failed to claim tokens",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY.detail(id) });
      qc.invalidateQueries({ queryKey: KEY.claims(id) });
      qc.invalidateQueries({ queryKey: KEY.list(address, "beneficiary") });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCancelVesting(id: string) {
  const { ensureAuthenticated, address } = useWallet();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await ensureAuthenticated();
      const { transaction } = await cancelVesting(id, token);
      return runTransactionFlow(transaction, token, {
        pending: "Cancelling vesting schedule",
        success: "Vesting schedule cancelled",
        failure: "Failed to cancel vesting schedule",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY.detail(id) });
      qc.invalidateQueries({ queryKey: KEY.list(address, "sender") });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
