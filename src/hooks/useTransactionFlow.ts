"use client";

import { toast } from "sonner";
import { freighterAdapter } from "@/lib/stellar/wallet";
import { getTransaction, submitTransaction } from "@/lib/api/transactions";
import type { TransactionRow } from "@/lib/types";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The shared "sign → submit → confirm" pipeline every write action goes
 * through: the backend has already built an unsigned transaction (a
 * `TransactionRow` with `xdr_unsigned`); this asks the wallet to sign it,
 * posts the signed XDR back, then polls until the backend/indexer reports a
 * terminal status. Every step surfaces a toast so the user always knows
 * which stage — signing, submitting, confirming — a pending action is in.
 */
export async function runTransactionFlow(
  transaction: TransactionRow,
  authToken: string,
  labels: { pending: string; success: string; failure: string },
): Promise<TransactionRow> {
  const toastId = toast.loading(`${labels.pending} — waiting for wallet signature…`);

  let signedXdr: string;
  try {
    signedXdr = await freighterAdapter.signTransaction(transaction.xdr_unsigned);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signing was cancelled.";
    toast.error("Signature declined", { id: toastId, description: message });
    throw err;
  }

  toast.loading(`${labels.pending} — submitting to the network…`, { id: toastId });
  let submitted: TransactionRow;
  try {
    submitted = await submitTransaction(transaction.id, signedXdr, authToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit the transaction.";
    toast.error(labels.failure, { id: toastId, description: message });
    throw err;
  }

  let current = submitted;
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (current.status === "submitted" || current.status === "pending_signature" || current.status === "building") {
    if (Date.now() > deadline) {
      toast.warning("Still confirming", {
        id: toastId,
        description: "This is taking longer than expected. Check Transactions for the latest status.",
      });
      return current;
    }
    toast.loading(`${labels.pending} — confirming on-chain…`, { id: toastId });
    await sleep(POLL_INTERVAL_MS);
    try {
      current = await getTransaction(current.id, authToken);
    } catch {
      // transient — keep polling until the deadline
    }
  }

  if (current.status === "success") {
    toast.success(labels.success, { id: toastId });
  } else {
    toast.error(labels.failure, { id: toastId, description: current.error_message ?? `Status: ${current.status}` });
  }

  return current;
}
