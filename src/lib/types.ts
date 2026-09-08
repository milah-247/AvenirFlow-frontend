/**
 * Domain types for the AvenirFlow API (`avenirflow-backend`).
 *
 * These mirror the backend's Postgres row shapes and `{ data: ... }`
 * response envelope exactly (see `avenirflow-backend/src/db/types.ts` and
 * the `*.routes.ts` files) so the frontend never has to guess field names.
 * Amounts are i128 base-unit integers transmitted as decimal strings to
 * avoid floating point precision loss — always do amount math with BigInt.
 */

export type TransactionKind =
  | "create_vesting"
  | "claim_vesting"
  | "cancel_vesting"
  | "create_stream"
  | "withdraw_stream";

export type TransactionStatus =
  | "building"
  | "pending_signature"
  | "submitted"
  | "success"
  | "failed"
  | "expired";

export type VestingStatus = "pending" | "active" | "cancelled" | "completed";
export type StreamStatus = "pending" | "active" | "cancelled" | "completed";

export interface AuthUser {
  id: string;
  walletId: string;
  publicKey: string;
}

export interface TransactionRow {
  id: string;
  hash: string | null;
  kind: TransactionKind;
  status: TransactionStatus;
  source_account: string;
  xdr_unsigned: string;
  xdr_signed: string | null;
  related_entity_type: "vesting_schedule" | "stream" | null;
  related_entity_id: string | null;
  result: unknown | null;
  error_message: string | null;
  ledger: number | string | null;
  created_by_wallet_id: string | null;
  submitted_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VestingScheduleRow {
  id: string;
  onchain_id: string | null;
  contract_id: string;
  sender: string;
  beneficiary: string;
  token_address: string;
  total_amount: string;
  claimed_amount: string;
  start_time: string;
  cliff_seconds: string | number;
  duration_seconds: string | number;
  revocable: boolean;
  status: VestingStatus;
  created_tx_id: string | null;
  cancelled_tx_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreamRow {
  id: string;
  onchain_id: string | null;
  contract_id: string;
  sender: string;
  recipient: string;
  token_address: string;
  deposit_amount: string;
  withdrawn_amount: string;
  start_time: string;
  stop_time: string;
  status: StreamStatus;
  created_tx_id: string | null;
  cancelled_tx_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimRow {
  id: string;
  vesting_schedule_id: string;
  claimant: string;
  amount: string;
  tx_id: string;
  ledger: number | string | null;
  created_at: string;
}

export interface WithdrawalRow {
  id: string;
  stream_id: string;
  withdrawer: string;
  amount: string;
  tx_id: string;
  ledger: number | string | null;
  created_at: string;
}

export interface Page<T> {
  items: T[];
  limit: number;
  offset: number;
  total: number;
}

/** A configured token available in the create-vesting/create-stream forms. */
export interface TokenInfo {
  contractId: string;
  code: string;
  name: string;
  decimals: number;
  icon?: string;
}

/** Aggregated stats shown on the dashboard. Computed client-side from list endpoints. */
export interface DashboardStats {
  totalAllocated: bigint;
  totalClaimed: bigint;
  activeVestingCount: number;
  activeStreamCount: number;
  upcomingCliffsCount: number;
  completedSchedulesCount: number;
}
