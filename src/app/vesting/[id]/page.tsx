"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { VestingDetail } from "@/components/vesting/VestingDetail";

export default function VestingDetailPage({ params }: PageProps<"/vesting/[id]">) {
  const { id } = use(params);

  return (
    <div>
      <Link href="/vesting" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to vesting
      </Link>
      <PageHeader title="Vesting schedule" />
      <RequireWallet>
        <VestingDetail id={id} />
      </RequireWallet>
    </div>
  );
}
