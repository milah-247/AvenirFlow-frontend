"use client";

import Link from "next/link";
import { Plus, Radio } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UpcomingCliffsCard } from "@/components/dashboard/UpcomingCliffsCard";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your vesting schedules, payment streams, and recent activity."
        actions={
          <>
            <Link href="/vesting/create">
              <Button variant="outline" size="sm">
                <Plus className="size-4" /> New vesting
              </Button>
            </Link>
            <Link href="/streams/create">
              <Button size="sm">
                <Radio className="size-4" /> New stream
              </Button>
            </Link>
          </>
        }
      />

      <RequireWallet>
        <div className="space-y-6">
          <StatsGrid />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentTransactionsCard />
            </div>
            <UpcomingCliffsCard />
          </div>
        </div>
      </RequireWallet>
    </div>
  );
}
