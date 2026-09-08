"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequireWallet } from "@/components/shared/RequireWallet";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { useRecentTransactions } from "@/hooks/useTransactions";

export default function TransactionsPage() {
  const { transactions, isLoading } = useRecentTransactions(50);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every on-chain action tied to your vesting schedules and payment streams."
      />
      <RequireWallet>
        <Card>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoading}
            emptyDescription="Create a vesting schedule or stream to see your transaction history here."
          />
        </Card>
      </RequireWallet>
    </div>
  );
}
