import { z } from "zod";

export const stellarAddressSchema = z
  .string()
  .trim()
  .regex(/^G[A-Z2-7]{55}$/, "Enter a valid Stellar public key (starts with G, 56 characters).");

export const contractIdSchema = z
  .string()
  .trim()
  .regex(/^C[A-Z2-7]{55}$/, "Enter a valid Soroban token contract id (starts with C, 56 characters).");

export const positiveDecimalSchema = z
  .string()
  .trim()
  .regex(/^\d*\.?\d+$/, "Enter a positive number.")
  .refine((v) => Number(v) > 0, "Amount must be greater than zero.");

/** Like positiveDecimalSchema but allows zero — for optional durations like a cliff. */
export const nonNegativeDecimalSchema = z
  .string()
  .trim()
  .regex(/^\d*\.?\d+$/, "Enter a number.")
  .refine((v) => Number(v) >= 0, "Cannot be negative.");

export type DurationUnit = "minutes" | "hours" | "days" | "weeks" | "months";

export const DURATION_UNIT_SECONDS: Record<DurationUnit, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 7 * 86400,
  months: 30 * 86400,
};

export function toSeconds(value: number, unit: DurationUnit): number {
  return Math.round(value * DURATION_UNIT_SECONDS[unit]);
}
