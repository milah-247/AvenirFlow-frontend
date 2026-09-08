"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { StreamTable } from "@/components/streams/StreamTable";
import { useStreamsAsRecipient, useStreamsAsSender } from "@/hooks/useStreams";

export default function StreamsListPage() {
  const [role, setRole] = useState<"recipient" | "sender">("recipient");
  const received = useStreamsAsRecipient();
  const created = useStreamsAsSender();
  const active = role === "recipient" ? received : created;

  return (
    <div>
      <PageHeader
        title="Streams"
        description="Continuous payment streams you've created or that pay you."
        actions={
          <Link href="/streams/create">
            <Button size="sm">
              <Plus className="size-4" /> New stream
            </Button>
          </Link>
        }
      />

      <RequireWallet>
        <div className="mb-4">
          <Tabs
            value={role}
            onChange={(v) => setRole(v as "recipient" | "sender")}
            options={[
              { value: "recipient", label: "Receiving", count: received.data?.total },
              { value: "sender", label: "Created", count: created.data?.total },
            ]}
          />
        </div>
        <Card>
          <StreamTable
            streams={active.data?.items ?? []}
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
