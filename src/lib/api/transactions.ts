import { apiRequest } from "./client";
import type { TransactionRow } from "../types";

export function getTransaction(id: string, token: string): Promise<TransactionRow> {
  return apiRequest(`/transactions/${id}`, { token });
}

export function submitTransaction(id: string, signedXdr: string, token: string): Promise<TransactionRow> {
  return apiRequest(`/transactions/${id}/submit`, { method: "POST", body: { signedXdr }, token });
}
