"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { streamFormSchema, type StreamFormValues } from "@/lib/validation/streams";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TokenSelect } from "@/components/shared/TokenSelect";
import { StreamPreview } from "./StreamPreview";
import { useCreateStream } from "@/hooks/useStreams";
import { parseTokenAmount } from "@/lib/utils";
import { findToken } from "@/lib/constants";

function toDatetimeLocalDefault(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60_000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StreamForm() {
  const router = useRouter();
  const createStream = useCreateStream();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      tokenContractId: "",
      recipient: "",
      ratePerSecond: "",
      startDateTime: toDatetimeLocalDefault(5),
      endDateTime: toDatetimeLocalDefault(60 * 24 * 30),
    },
  });

  const values = watch();
  const token = findToken(values.tokenContractId);

  const onSubmit = async (data: StreamFormValues) => {
    const tokenInfo = findToken(data.tokenContractId);
    if (!tokenInfo) {
      toast.error("Unknown token", { description: "Select a configured token or verify the contract id." });
      return;
    }
    const rate = parseTokenAmount(data.ratePerSecond, tokenInfo.decimals);
    if (rate === null || rate <= 0n) {
      toast.error("Invalid rate");
      return;
    }
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    const durationSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    const deposit = rate * BigInt(durationSeconds);

    try {
      const { stream } = await createStream.mutateAsync({
        recipient: data.recipient,
        token: data.tokenContractId,
        deposit: deposit.toString(),
        startTime: start.toISOString(),
        stopTime: end.toISOString(),
      });
      router.push(`/streams/${stream.id}`);
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

          <Field label="Recipient address" required error={errors.recipient?.message} hint="The Stellar account that will withdraw from the stream.">
            <Input placeholder="G…" className="font-mono" invalid={!!errors.recipient} {...register("recipient")} />
          </Field>

          <Field label="Rate per second" required error={errors.ratePerSecond?.message} hint="How much the recipient earns for every second the stream is active.">
            <Input type="text" inputMode="decimal" placeholder="0.00" invalid={!!errors.ratePerSecond} {...register("ratePerSecond")} />
          </Field>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 space-y-5">
          <Field label="Start time" required error={errors.startDateTime?.message}>
            <Input type="datetime-local" invalid={!!errors.startDateTime} {...register("startDateTime")} />
          </Field>
          <Field label="End time" required error={errors.endDateTime?.message}>
            <Input type="datetime-local" invalid={!!errors.endDateTime} {...register("endDateTime")} />
          </Field>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting || createStream.isPending} className="w-full sm:w-auto">
          Create stream
        </Button>
      </div>

      <StreamPreview
        token={token ?? null}
        recipient={values.recipient}
        ratePerSecond={values.ratePerSecond}
        startDateTime={values.startDateTime}
        endDateTime={values.endDateTime}
      />
    </form>
  );
}
