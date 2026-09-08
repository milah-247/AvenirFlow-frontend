/**
 * Client-side mirrors of the pure arithmetic in the AvenirFlow Soroban
 * contract (`contracts/avenirflow/src/vesting.rs` and `stream.rs`). Kept
 * bit-for-bit equivalent (integer division, same clamping) so progress bars
 * and "claimable now" previews match what the contract will actually pay
 * out. The API is still the source of truth for `claimed_amount` /
 * `withdrawn_amount` — this only estimates the *vested/streamed* side
 * between refreshes.
 */
import type { StreamRow, VestingScheduleRow } from "../types";

/**
 * Total amount vested as of `nowUnix`:
 * - 0 before `start_time + cliff_duration`
 * - `total_amount` at/after `start_time + vesting_duration`
 * - otherwise `total_amount * (now - start_time) / vesting_duration`
 */
export function vestedAmount(schedule: VestingScheduleRow, nowUnix: number): bigint {
  const total = BigInt(schedule.total_amount);
  const start = Math.floor(new Date(schedule.start_time).getTime() / 1000);
  const cliff = Number(schedule.cliff_seconds);
  const duration = Number(schedule.duration_seconds);

  if (schedule.status === "cancelled") {
    // The chain freezes total_amount at the vested amount on cancellation;
    // until a refresh reconciles claimed_amount, claimed_amount is the best
    // known lower bound on what had vested.
    return BigInt(schedule.claimed_amount);
  }

  const cliffEnd = start + cliff;
  if (nowUnix < cliffEnd) return 0n;

  const vestingEnd = start + duration;
  if (nowUnix >= vestingEnd) return total;

  const elapsed = BigInt(nowUnix - start);
  return (total * elapsed) / BigInt(duration);
}

export function claimableAmount(schedule: VestingScheduleRow, nowUnix: number): bigint {
  const vested = vestedAmount(schedule, nowUnix);
  const claimed = BigInt(schedule.claimed_amount);
  return vested > claimed ? vested - claimed : 0n;
}

export function vestingProgressPct(schedule: VestingScheduleRow, nowUnix: number): number {
  const total = BigInt(schedule.total_amount);
  if (total === 0n) return 0;
  const vested = vestedAmount(schedule, nowUnix);
  return Math.min(100, Number((vested * 10000n) / total) / 100);
}

export function cliffEndUnix(schedule: VestingScheduleRow): number {
  return Math.floor(new Date(schedule.start_time).getTime() / 1000) + Number(schedule.cliff_seconds);
}

export function vestingEndUnix(schedule: VestingScheduleRow): number {
  return Math.floor(new Date(schedule.start_time).getTime() / 1000) + Number(schedule.duration_seconds);
}

/**
 * Total amount streamed (earned) as of `nowUnix`, capped at the deposit —
 * `rate_per_second * min(now, end_time) - start_time`, or 0 before start.
 */
export function streamedAmount(stream: StreamRow, nowUnix: number, ratePerSecond: bigint): bigint {
  const start = Math.floor(new Date(stream.start_time).getTime() / 1000);
  const end = Math.floor(new Date(stream.stop_time).getTime() / 1000);
  const deposit = BigInt(stream.deposit_amount);

  if (stream.status === "cancelled") return BigInt(stream.withdrawn_amount);
  if (nowUnix <= start) return 0n;

  const cappedNow = Math.min(nowUnix, end);
  const elapsed = BigInt(cappedNow - start);
  const earned = ratePerSecond * elapsed;
  return earned > deposit ? deposit : earned;
}

export function withdrawableAmount(stream: StreamRow, nowUnix: number, ratePerSecond: bigint): bigint {
  const streamed = streamedAmount(stream, nowUnix, ratePerSecond);
  const withdrawn = BigInt(stream.withdrawn_amount);
  return streamed > withdrawn ? streamed - withdrawn : 0n;
}

export function streamProgressPct(stream: StreamRow, nowUnix: number, ratePerSecond: bigint): number {
  const deposit = BigInt(stream.deposit_amount);
  if (deposit === 0n) return 0;
  const streamed = streamedAmount(stream, nowUnix, ratePerSecond);
  return Math.min(100, Number((streamed * 10000n) / deposit) / 100);
}

/** Derives the effective rate/second from a stream row (`deposit / (stop - start)`, floor division). */
export function deriveRatePerSecond(stream: StreamRow): bigint {
  const start = Math.floor(new Date(stream.start_time).getTime() / 1000);
  const end = Math.floor(new Date(stream.stop_time).getTime() / 1000);
  const duration = end - start;
  if (duration <= 0) return 0n;
  return BigInt(stream.deposit_amount) / BigInt(duration);
}
