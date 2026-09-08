"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { VestingForm } from "@/components/vesting/VestingForm";

export default function CreateVestingPage() {
  return (
    <div>
      <PageHeader title="Create vesting schedule" description="Lock tokens for a recipient with an optional cliff and linear vesting." />
      <RequireWallet>
        <VestingForm />
      </RequireWallet>
    </div>
  );
}
