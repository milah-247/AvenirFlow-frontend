"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { StreamDetail } from "@/components/streams/StreamDetail";

export default function StreamDetailPage({ params }: PageProps<"/streams/[id]">) {
  const { id } = use(params);

  return (
    <div>
      <Link href="/streams" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to streams
      </Link>
      <PageHeader title="Payment stream" />
      <RequireWallet>
        <StreamDetail id={id} />
      </RequireWallet>
    </div>
  );
}
