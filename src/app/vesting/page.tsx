"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { VestingTable } from "@/components/vesting/VestingTable";
import { useVestingSchedulesAsBeneficiary, useVestingSchedulesAsSender } from "@/hooks/useVesting";

export default function VestingListPage() {
  const [role, setRole] = useState<"beneficiary" | "sender">("beneficiary");
  const received = useVestingSchedulesAsBeneficiary();
  const created = useVestingSchedulesAsSender();
  const active = role === "beneficiary" ? received : created;

  return (
    <div>
      <PageHeader
        title="Vesting"
        description="Token vesting schedules you've created or that vest to you."
        actions={
          <Link href="/vesting/create">
            <Button size="sm">
              <Plus className="size-4" /> New vesting schedule
            </Button>
          </Link>
        }
      />

      <RequireWallet>
        <div className="mb-4">
          <Tabs
            value={role}
            onChange={(v) => setRole(v as "beneficiary" | "sender")}
            options={[
              { value: "beneficiary", label: "Received", count: received.data?.total },
              { value: "sender", label: "Created", count: created.data?.total },
            ]}
          />
        </div>
        <Card>
          <VestingTable
            schedules={active.data?.items ?? []}
            isLoading={active.isLoading}
            isError={active.isError}
            onRetry={() => active.refetch()}
            role={role}
          />
        </Card>
      </RequireWallet>
    </div>
  );
}
