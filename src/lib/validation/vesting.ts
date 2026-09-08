import { z } from "zod";
import {
  contractIdSchema,
  DURATION_UNIT_SECONDS,
  nonNegativeDecimalSchema,
  positiveDecimalSchema,
  stellarAddressSchema,
} from "./common";

const durationUnitSchema = z.enum(["minutes", "hours", "days", "weeks", "months"]);

export const vestingFormSchema = z
  .object({
    tokenContractId: contractIdSchema,
    recipient: stellarAddressSchema,
    totalAmount: positiveDecimalSchema,
    startDate: z.string().min(1, "Choose a start date."),
    // Kept as strings (not z.coerce.number()) so the form's field type stays
    // string-in/string-out — matching what <input> actually produces and
    // avoiding a resolver type mismatch with react-hook-form. Converted to
    // seconds with `toSeconds(Number(...), unit)` at submit time.
    cliffValue: nonNegativeDecimalSchema,
    cliffUnit: durationUnitSchema,
    vestingValue: positiveDecimalSchema,
    vestingUnit: durationUnitSchema,
    cancellable: z.boolean(),
  })
  .refine(
    (v) => Number(v.cliffValue) * DURATION_UNIT_SECONDS[v.cliffUnit] <= Number(v.vestingValue) * DURATION_UNIT_SECONDS[v.vestingUnit],
    { message: "Cliff duration cannot exceed the total vesting duration.", path: ["cliffValue"] },
  );

export type VestingFormValues = z.infer<typeof vestingFormSchema>;

export const vestingFormDefaults: Partial<VestingFormValues> = {
  cliffValue: "0",
  cliffUnit: "days",
  vestingValue: "12",
  vestingUnit: "months",
  cancellable: false,
};
