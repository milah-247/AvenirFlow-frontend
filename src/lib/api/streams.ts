import { apiRequest } from "./client";
import type { Page, StreamRow, TransactionRow, WithdrawalRow } from "../types";

export interface CreateStreamInput {
  recipient: string;
  token: string;
  deposit: string; // base units, decimal string — rate * duration
  startTime: string; // ISO
  stopTime: string; // ISO
}

export function createStream(
  input: CreateStreamInput,
  token: string,
): Promise<{ stream: StreamRow; transaction: TransactionRow }> {
  return apiRequest("/streams", { method: "POST", body: input, token });
}

export function listStreams(
  params: { recipient?: string; sender?: string; limit?: number; offset?: number },
): Promise<Page<StreamRow>> {
  return apiRequest("/streams", { query: params });
}

export function getStream(id: string, opts: { refresh?: boolean } = {}): Promise<StreamRow> {
  return apiRequest(`/streams/${id}`, { query: { refresh: opts.refresh } });
}

export function listStreamWithdrawals(
  id: string,
  params: { limit?: number; offset?: number } = {},
): Promise<Page<WithdrawalRow>> {
  return apiRequest(`/streams/${id}/withdrawals`, { query: params });
}

export function withdrawFromStream(
  id: string,
  amount: string,
  token: string,
): Promise<{ transaction: TransactionRow }> {
  return apiRequest(`/streams/${id}/withdraw`, { method: "POST", body: { amount }, token });
}
