"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vestingFormDefaults, vestingFormSchema, type VestingFormValues } from "@/lib/validation/vesting";
import { toSeconds } from "@/lib/validation/common";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { TokenSelect } from "@/components/shared/TokenSelect";
import { VestingPreview } from "./VestingPreview";
import { useCreateVestingSchedule } from "@/hooks/useVesting";
import { parseTokenAmount } from "@/lib/utils";
import { findToken } from "@/lib/constants";
import { toast } from "sonner";

const DURATION_UNITS = ["minutes", "hours", "days", "weeks", "months"] as const;

function toDatetimeLocalDefault(minutesFromNow = 5): string {
  const d = new Date(Date.now() + minutesFromNow * 60_000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function VestingForm() {
  const router = useRouter();
  const createVesting = useCreateVestingSchedule();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VestingFormValues>({
    resolver: zodResolver(vestingFormSchema),
    defaultValues: { ...vestingFormDefaults, startDate: toDatetimeLocalDefault(), tokenContractId: "", recipient: "", totalAmount: "" },
  });

  const values = watch();
  const token = findToken(values.tokenContractId);

  const onSubmit = async (data: VestingFormValues) => {
    const tokenInfo = findToken(data.tokenContractId);
    if (!tokenInfo) {
      toast.error("Unknown token", { description: "Select a configured token or verify the contract id." });
      return;
    }
    const amount = parseTokenAmount(data.totalAmount, tokenInfo.decimals);
    if (amount === null) {
      toast.error("Invalid amount");
      return;
    }

    try {
      const { vestingSchedule } = await createVesting.mutateAsync({
        beneficiary: data.recipient,
        token: data.tokenContractId,
        amount: amount.toString(),
        startTime: new Date(data.startDate).toISOString(),
        cliffSeconds: toSeconds(Number(data.cliffValue), data.cliffUnit),
        durationSeconds: toSeconds(Number(data.vestingValue), data.vestingUnit),
        revocable: data.cancellable,
      });
      router.push(`/vesting/${vestingSchedule.id}`);
    } catch {
      // toast already shown by the transaction flow
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="rounded-card border border-border bg-surface p-5 space-y-5">
          <Field label="Token" required error={errors.tokenContractId?.message}>
            <Controller
              control={control}
              name="tokenContractId"
              render={({ field }) => (
                <TokenSelect value={field.value} onChange={field.onChange} invalid={!!errors.tokenContractId} />
              )}
            />
          </Field>

          <Field label="Recipient address" required error={errors.recipient?.message} hint="The Stellar account that will receive vested tokens.">
            <Input placeholder="G…" className="font-mono" invalid={!!errors.recipient} {...register("recipient")} />
          </Field>

          <Field label="Total amount" required error={errors.totalAmount?.message}>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              invalid={!!errors.totalAmount}
              {...register("totalAmount")}
            />
          </Field>

          <Field label="Start date" required error={errors.startDate?.message}>
            <Input type="datetime-local" invalid={!!errors.startDate} {...register("startDate")} />
          </Field>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 space-y-5">
          <Field label="Cliff duration" error={errors.cliffValue?.message} hint="Nothing is claimable until the cliff passes. Use 0 for no cliff.">
            <div className="flex gap-2">
              <Input type="number" min={0} step="any" className="max-w-32" {...register("cliffValue")} />
              <Select {...register("cliffUnit")}>
                {DURATION_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </Field>

          <Field label="Vesting duration" required error={errors.vestingValue?.message} hint="Total time for the full amount to vest, starting from the start date.">
            <div className="flex gap-2">
              <Input type="number" min={0} step="any" className="max-w-32" {...register("vestingValue")} />
              <Select {...register("vestingUnit")}>
                {DURATION_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </Field>

          <Controller
            control={control}
            name="cancellable"
            render={({ field }) => (
              <Switch
                id="cancellable"
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Allow cancellation"
                description="You'll be able to cancel this schedule before it completes."
              />
            )}
          />
        </div>

        <Button type="submit" size="lg" loading={isSubmitting || createVesting.isPending} className="w-full sm:w-auto">
          Create vesting schedule
        </Button>
      </div>

      <VestingPreview
        token={token ?? null}
        recipient={values.recipient}
        totalAmount={values.totalAmount}
        startDate={values.startDate}
        cliffValue={Number(values.cliffValue) || 0}
        cliffUnit={values.cliffUnit}
        vestingValue={Number(values.vestingValue) || 0}
        vestingUnit={values.vestingUnit}
        cancellable={values.cancellable}
      />
    </form>
  );
}
