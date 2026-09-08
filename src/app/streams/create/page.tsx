"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { StreamForm } from "@/components/streams/StreamForm";

export default function CreateStreamPage() {
  return (
    <div>
      <PageHeader title="Create payment stream" description="Pay a recipient continuously, second by second, between a start and end time." />
      <RequireWallet>
        <StreamForm />
      </RequireWallet>
    </div>
  );
}
