"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { useRecentTransactions } from "@/hooks/useTransactions";

export function RecentTransactionsCard() {
  const { transactions, isLoading } = useRecentTransactions(8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <div className="mt-3">
        <TransactionsTable transactions={transactions} isLoading={isLoading} />
      </div>
    </Card>
  );
}
