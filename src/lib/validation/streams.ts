import { z } from "zod";
import { contractIdSchema, positiveDecimalSchema, stellarAddressSchema } from "./common";

export const streamFormSchema = z
  .object({
    tokenContractId: contractIdSchema,
    recipient: stellarAddressSchema,
    ratePerSecond: positiveDecimalSchema,
    startDateTime: z.string().min(1, "Choose a start time."),
    endDateTime: z.string().min(1, "Choose an end time."),
  })
  .refine((v) => new Date(v.endDateTime).getTime() > new Date(v.startDateTime).getTime(), {
    message: "End time must be after the start time.",
    path: ["endDateTime"],
  });

export type StreamFormValues = z.infer<typeof streamFormSchema>;
