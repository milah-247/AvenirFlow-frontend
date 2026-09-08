import { apiRequest } from "./client";
import type { ClaimRow, Page, TransactionRow, VestingScheduleRow } from "../types";

export interface CreateVestingInput {
  beneficiary: string;
  token: string;
  amount: string; // base units, decimal string
  startTime: string; // ISO
  cliffSeconds: number;
  durationSeconds: number;
  revocable: boolean;
}

export function createVestingSchedule(
  input: CreateVestingInput,
  token: string,
): Promise<{ vestingSchedule: VestingScheduleRow; transaction: TransactionRow }> {
  return apiRequest("/vesting-schedules", { method: "POST", body: input, token });
}

export function listVestingSchedules(
  params: { beneficiary?: string; sender?: string; limit?: number; offset?: number },
): Promise<Page<VestingScheduleRow>> {
  return apiRequest("/vesting-schedules", { query: params });
}

export function getVestingSchedule(id: string, opts: { refresh?: boolean } = {}): Promise<VestingScheduleRow> {
  return apiRequest(`/vesting-schedules/${id}`, { query: { refresh: opts.refresh } });
}

export function listVestingClaims(
  id: string,
  params: { limit?: number; offset?: number } = {},
): Promise<Page<ClaimRow>> {
  return apiRequest(`/vesting-schedules/${id}/claims`, { query: params });
}

export function claimVesting(id: string, token: string): Promise<{ transaction: TransactionRow }> {
  return apiRequest(`/vesting-schedules/${id}/claim`, { method: "POST", token });
}

export function cancelVesting(id: string, token: string): Promise<{ transaction: TransactionRow }> {
  return apiRequest(`/vesting-schedules/${id}/cancel`, { method: "POST", token });
}
